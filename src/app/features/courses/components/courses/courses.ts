import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loading } from '@shared/components';
import { CourseService } from '../../services/course.service';
import { Course } from '../../models/course.model';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, Loading, RouterLink, FormsModule],
  templateUrl: './courses.html',
  styleUrl: './courses.css'
})
export class Courses {
  // Signals para el estado del componente
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  courses = signal<Course[]>([]);
  allCourses = signal<Course[]>([]);
  successMessage = signal<string | null>(null);
  showSuccess = signal<boolean>(false);
  showDeleteConfirmation = signal<boolean>(false);
  courseToDelete = signal<string | null>(null);
  filter = signal<string>('');
  
  // Inyección de servicios
  authService = inject(AuthService);

  constructor(private courseService: CourseService, private router: Router) {
    // Effect para filtrar cursos
    effect(() => {
      if (!this.filter()) {
        this.courses.set(this.allCourses());
      } else {
        const searchTerm = this.filter().toLowerCase();
        
        this.courses.set(this.allCourses()
          .filter((course) => {
            return course.name.toLowerCase().includes(searchTerm) ||
                   course.code.toLowerCase().includes(searchTerm) ||
                   course.description.toLowerCase().includes(searchTerm);
          })
        );
      }
    });
  }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading.set(true);
    this.error.set(null);

    this.courseService.getAllCourses()
      .then(courses => {
        this.allCourses.set(courses);
        this.courses.set(courses);
        setTimeout(() => {
          this.loading.set(false);
        }, 800);
      })
      .catch(error => {
        console.error('Error al cargar cursos:', error);
        this.error.set(typeof error === 'string' ? error : 'Error al cargar los cursos');
        this.loading.set(false);
      });
  }

  confirmDelete(id: string): void {
    this.courseToDelete.set(id);
    this.showDeleteConfirmation.set(true);
  }
  
  cancelDelete(): void {
    this.courseToDelete.set(null);
    this.showDeleteConfirmation.set(false);
  }

  deleteCourse(): void {
    if (!this.courseToDelete()) return;
    
    this.loading.set(true);
    this.error.set(null);
    this.showDeleteConfirmation.set(false);
    
    const resultDelete = this.courseService.deleteCourse(this.courseToDelete()!);
    
    if (resultDelete.success) {
      this.successMessage.set(resultDelete.message);
      this.showSuccess.set(true);
      setTimeout(() => {
        this.showSuccess.set(false);
        this.loading.set(false);
        this.loadCourses();
      }, 3000);
    } else {
      this.error.set(resultDelete.message);
      this.loading.set(false);
    }
    
    this.courseToDelete.set(null);
  }
  
  // Método para verificar si el usuario puede editar/eliminar cursos
  canEditCourse(): boolean {
    return !this.authService.isStudent();
  }
}