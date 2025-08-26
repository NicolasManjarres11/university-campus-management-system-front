import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loading } from '@shared/components';
import { ScheduleService } from '../../services/schedule.service';
import { Schedule } from '../../models/schedule.model';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services';
import { CourseService } from '@features/courses/services/course.service';
import { UserService } from '@features/users/services/user.service';

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [CommonModule, Loading, RouterLink, FormsModule],
  templateUrl: './schedules.html',
  styleUrl: './schedules.css'
})
export class Schedules {
  // Signals para el estado del componente
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  schedules = signal<Schedule[]>([]);
  allSchedules = signal<Schedule[]>([]);
  successMessage = signal<string | null>(null);
  showSuccess = signal<boolean>(false);
  showDeleteConfirmation = signal<boolean>(false);
  scheduleToDelete = signal<string | null>(null);
  filter = signal<string>('');
  
  // Mapeos para mostrar nombres en lugar de IDs
  courseNames = signal<Map<string, string>>(new Map());
  professorNames = signal<Map<string, string>>(new Map());
  
  // Inyección de servicios
  authService = inject(AuthService);

  constructor(
    private scheduleService: ScheduleService, 
    private courseService: CourseService,
    private userService: UserService,
    private router: Router
  ) {
    // Effect para filtrar horarios
    effect(() => {
      if (!this.filter()) {
        this.schedules.set(this.allSchedules());
      } else {
        const searchTerm = this.filter().toLowerCase();
        
        this.schedules.set(this.allSchedules()
          .filter((schedule) => {
            const courseName = this.courseNames().get(schedule.courseId) || '';
            const professorName = this.professorNames().get(schedule.professorId) || '';
            const scheduleText = schedule.schedule.toLowerCase();
            
            return courseName.toLowerCase().includes(searchTerm) ||
                   professorName.toLowerCase().includes(searchTerm) ||
                   scheduleText.includes(searchTerm);
          })
        );
      }
    });
  }

  ngOnInit(): void {
    this.loadSchedules();
    this.loadCourseNames();
    this.loadProfessorNames();
  }

  loadSchedules(): void {
    this.loading.set(true);
    this.error.set(null);

    this.scheduleService.getSchedules()
      .then(schedules => {
        this.allSchedules.set(schedules);
        this.schedules.set(schedules);
        setTimeout(() => {
          this.loading.set(false);
        }, 800);
      })
      .catch(error => {
        console.error('Error al cargar horarios:', error);
        this.error.set(typeof error === 'string' ? error : 'Error al cargar los horarios');
        this.loading.set(false);
      });
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
  
  loadProfessorNames(): void {
    this.userService.getAllUsersBasicInfo()
      .then(users => {
        const professorMap = new Map<string, string>();
        users.forEach(user => {
          professorMap.set(user.id, `${user.name} ${user.lastname}`);
        });
        this.professorNames.set(professorMap);
      })
      .catch(error => {
        console.error('Error al cargar nombres de profesores:', error);
      });
  }

  confirmDelete(id: string): void {
    this.scheduleToDelete.set(id);
    this.showDeleteConfirmation.set(true);
  }
  
  cancelDelete(): void {
    this.scheduleToDelete.set(null);
    this.showDeleteConfirmation.set(false);
  }

  deleteSchedule(): void {
    if (!this.scheduleToDelete()) return;
    
    this.loading.set(true);
    this.error.set(null);
    this.showDeleteConfirmation.set(false);
    
    const resultDelete = this.scheduleService.deleteSchedule(this.scheduleToDelete()!);
    
    if (resultDelete.success) {
      this.successMessage.set(resultDelete.message);
      this.showSuccess.set(true);
      setTimeout(() => {
        this.showSuccess.set(false);
        this.loading.set(false);
        this.loadSchedules();
      }, 3000);
    } else {
      this.error.set(resultDelete.message);
      this.loading.set(false);
    }
    
    this.scheduleToDelete.set(null);
  }
  
  // Método para verificar si el usuario puede editar/eliminar horarios (admin o profesor)
  canEditSchedule(): boolean {
    return this.authService.isAdmin() || this.authService.isProfessor();
  }
  
  // Obtener nombre de curso por ID
  getCourseName(courseId: string): string {
    return this.courseNames().get(courseId) || 'Curso desconocido';
  }
  
  // Obtener nombre de profesor por ID
  getProfessorName(professorId: string): string {
    return this.professorNames().get(professorId) || 'Profesor desconocido';
  }
}