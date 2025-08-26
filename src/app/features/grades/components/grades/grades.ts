import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loading } from '@shared/components';
import { GradeService } from '../../services/grade.service';
import { Grade } from '../../models/grade.model';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services';
import { CourseService } from '@features/courses/services/course.service';
import { UserService } from '@features/users/services/user.service';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule, Loading, RouterLink, FormsModule],
  templateUrl: './grades.html',
  styleUrl: './grades.css'
})
export class Grades {
  // Signals para el estado del componente
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  grades = signal<Grade[]>([]);
  allGrades = signal<Grade[]>([]);
  successMessage = signal<string | null>(null);
  showSuccess = signal<boolean>(false);
  showDeleteConfirmation = signal<boolean>(false);
  gradeToDelete = signal<string | null>(null);
  filter = signal<string>('');
  
  // Mapeos para mostrar nombres en lugar de IDs
  courseNames = signal<Map<string, string>>(new Map());
  professorNames = signal<Map<string, string>>(new Map());
  studentNames = signal<Map<string, string>>(new Map());
  
  // Inyección de servicios
  authService = inject(AuthService);
  currentUser = signal(this.authService.user());

  constructor(
    private gradeService: GradeService, 
    private courseService: CourseService,
    private userService: UserService,
    private router: Router
  ) {
    // Effect para filtrar calificaciones
    effect(() => {
      if (!this.filter()) {
        // Filtrar por rol de usuario
        this.filterGradesByUserRole();
      } else {
        const searchTerm = this.filter().toLowerCase();
        const filteredGrades = this.getGradesByUserRole().filter((grade) => {
          const courseName = this.courseNames().get(grade.courseId) || '';
          const professorName = this.professorNames().get(grade.professorId) || '';
          const studentName = this.studentNames().get(grade.studentId) || '';
          
          return courseName.toLowerCase().includes(searchTerm) ||
                 professorName.toLowerCase().includes(searchTerm) ||
                 studentName.toLowerCase().includes(searchTerm) ||
                 grade.grade.toString().includes(searchTerm);
        });
        
        this.grades.set(filteredGrades);
      }
    });
  }

  ngOnInit(): void {
    this.loadGrades();
    this.loadCourseNames();
    this.loadUserNames();
  }

  loadGrades(): void {
    this.loading.set(true);
    this.error.set(null);

    this.gradeService.getGradesForCurrentUser()
      .then(grades => {
        this.allGrades.set(grades);
        this.filterGradesByUserRole();
        setTimeout(() => {
          this.loading.set(false);
        }, 800);
      })
      .catch(error => {
        console.error('Error al cargar calificaciones:', error);
        this.error.set(typeof error === 'string' ? error : 'Error al cargar las calificaciones');
        this.loading.set(false);
      });
  }
  
  // Filtrar calificaciones según el rol del usuario
  filterGradesByUserRole(): void {
    this.grades.set(this.getGradesByUserRole());
  }
  
  // Obtener calificaciones según el rol del usuario
  getGradesByUserRole(): Grade[] {
    const user = this.currentUser();
    if (!user) return [];
    
    // Si es admin o profesor, puede ver todas las calificaciones
    if (user.role === 'admin') {
      return this.allGrades();
    } 
    // Si es profesor, solo ve las calificaciones que ha puesto
    else if (user.role === 'professor') {
      return this.allGrades().filter(grade => grade.professorId === user.id);
    } 
    // Si es estudiante, solo ve sus propias calificaciones
    else {
      return this.allGrades().filter(grade => grade.studentId === user.id);
    }
  }
  
  loadCourseNames(): void {
    this.courseService.getAllCourses()
      .then(courses => {
        const courseMap = new Map<string, string>();
        courses.forEach(course => {
          courseMap.set(course.id, course.name);
        });
        this.courseNames.set(courseMap);
      })
      .catch(error => {
        console.error('Error al cargar nombres de cursos:', error);
      });
  }
  
  loadUserNames(): void {
    this.userService.getAllUsersBasicInfo()
      .then(users => {
        const professorMap = new Map<string, string>();
        const studentMap = new Map<string, string>();
        
        users.forEach(user => {
          const fullName = `${user.name} ${user.lastname}`;
          if (user.role === 'professor') {
            professorMap.set(user.id, fullName);
          }
          // Todos los usuarios pueden ser estudiantes para este propósito
          studentMap.set(user.id, fullName);
        });
        
        this.professorNames.set(professorMap);
        this.studentNames.set(studentMap);
      })
      .catch(error => {
        console.error('Error al cargar nombres de usuarios:', error);
      });
  }

  confirmDelete(id: string): void {
    this.gradeToDelete.set(id);
    this.showDeleteConfirmation.set(true);
  }
  
  cancelDelete(): void {
    this.gradeToDelete.set(null);
    this.showDeleteConfirmation.set(false);
  }

  deleteGrade(): void {
    if (!this.gradeToDelete()) return;
    
    this.loading.set(true);
    this.error.set(null);
    this.showDeleteConfirmation.set(false);
    
    const resultDelete = this.gradeService.deleteGrade(this.gradeToDelete()!);
    
    if (resultDelete.success) {
      this.successMessage.set(resultDelete.message);
      this.showSuccess.set(true);
      setTimeout(() => {
        this.showSuccess.set(false);
        this.loading.set(false);
        this.loadGrades();
      }, 3000);
    } else {
      this.error.set(resultDelete.message);
      this.loading.set(false);
    }
    
    this.gradeToDelete.set(null);
  }
  
  // Método para verificar si el usuario puede editar/eliminar calificaciones (admin o profesor)
  canEditGrade(grade?: Grade): boolean {
    const user = this.currentUser();
    if (!user) return false;
    
    if (user.role === 'admin') return true;
    if (user.role === 'professor' && grade) {
      return grade.professorId === user.id;
    }
    return false;
  }
  
  // Método para verificar si el usuario puede crear calificaciones
  canCreateGrade(): boolean {
    const user = this.currentUser();
    return user?.role === 'admin' || user?.role === 'professor';
  }
  
  // Obtener nombre de curso por ID
  getCourseName(courseId: string): string {
    return this.courseNames().get(courseId) || 'Curso desconocido';
  }
  
  // Obtener nombre de profesor por ID
  getProfessorName(professorId: string): string {
    return this.professorNames().get(professorId) || 'Profesor desconocido';
  }
  
  // Obtener nombre de estudiante por ID
  getStudentName(studentId: string): string {
    return this.studentNames().get(studentId) || 'Estudiante desconocido';
  }
  
  // Obtener clase CSS para la calificación
  getGradeClass(grade: number): string {
    if (grade >= 4.5) return 'bg-green-100 text-green-800'; // Excelente
    if (grade >= 4.0) return 'bg-blue-100 text-blue-800';   // Muy bueno
    if (grade >= 3.5) return 'bg-yellow-100 text-yellow-800'; // Bueno
    if (grade >= 3.0) return 'bg-orange-100 text-orange-800'; // Aprobado
    return 'bg-red-100 text-red-800'; // Reprobado
  }
}