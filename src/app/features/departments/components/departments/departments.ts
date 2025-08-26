import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loading } from '@shared/components';
import { DepartmentService } from '../../services/department.service';
import { Department } from '../../models/department.model';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services';
import { EntityRelationshipService } from '@core/services';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, Loading, RouterLink, FormsModule],
  templateUrl: './departments.html',
  styleUrl: './departments.css'
})
export class Departments {
  // Signals para el estado del componente
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  departments = signal<Department[]>([]);
  allDepartments = signal<Department[]>([]);
  successMessage = signal<string | null>(null);
  showSuccess = signal<boolean>(false);
  showDeleteConfirmation = signal<boolean>(false);
  departmentToDelete = signal<string | null>(null);
  filter = signal<string>('');
  
  // Cache para departamentos con cursos
  departmentsWithCourses = new Map<string, boolean>();
  
  // Inyección de servicios
  authService = inject(AuthService);
  relationshipService = inject(EntityRelationshipService);

  constructor(private departmentService: DepartmentService, private router: Router) {
    // Effect para filtrar departamentos
    effect(() => {
      if (!this.filter()) {
        this.departments.set(this.allDepartments());
      } else {
        const searchTerm = this.filter().toLowerCase();
        
        this.departments.set(this.allDepartments()
          .filter((department) => {
            return department.name.toLowerCase().includes(searchTerm) ||
                   department.description.toLowerCase().includes(searchTerm);
          })
        );
      }
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading.set(true);
    this.error.set(null);
    // Limpiar el caché de departamentos con cursos
    this.departmentsWithCourses.clear();

    this.departmentService.getAllDepartments()
      .then(departments => {
        this.allDepartments.set(departments);
        this.departments.set(departments);
        
        // Precalcular y cachear qué departamentos tienen cursos
        departments.forEach(dept => {
          const hasCourses = this.relationshipService.hasDepartmentCourses(dept.id);
          this.departmentsWithCourses.set(dept.id, hasCourses);
        });
        
        setTimeout(() => {
          this.loading.set(false);
        }, 800);
      })
      .catch(error => {
        console.error('Error al cargar departamentos:', error);
        this.error.set(typeof error === 'string' ? error : 'Error al cargar los departamentos');
        this.loading.set(false);
      });
  }

  confirmDelete(id: string): void {
    this.departmentToDelete.set(id);
    this.showDeleteConfirmation.set(true);
  }
  
  cancelDelete(): void {
    this.departmentToDelete.set(null);
    this.showDeleteConfirmation.set(false);
  }

  deleteDepartment(): void {
    if (!this.departmentToDelete()) return;
    
    this.loading.set(true);
    this.error.set(null);
    this.showDeleteConfirmation.set(false);
    
    const resultDelete = this.departmentService.deleteDepartment(this.departmentToDelete()!);
    
    if (resultDelete.success) {
      this.successMessage.set(resultDelete.message);
      this.showSuccess.set(true);
      setTimeout(() => {
        this.showSuccess.set(false);
        this.loading.set(false);
        this.loadDepartments();
      }, 3000);
    } else {
      this.error.set(resultDelete.message);
      this.loading.set(false);
    }
    
    this.departmentToDelete.set(null);
  }
  
  // Método para verificar si el usuario puede editar/eliminar departamentos (solo admin)
  canEditDepartment(): boolean {
    return this.authService.isAdmin();
  }
  
  // Verificar si un departamento tiene cursos asociados
  hasCourses(departmentId: string): boolean {
    // Usar el valor cacheado si existe
    if (this.departmentsWithCourses.has(departmentId)) {
      return this.departmentsWithCourses.get(departmentId)!;
    }
    
    // Si no está en caché, calcularlo y almacenarlo
    const result = this.relationshipService.hasDepartmentCourses(departmentId);
    this.departmentsWithCourses.set(departmentId, result);
    return result;
  }
  
  // Contar cuántos cursos tiene un departamento
  countCourses(departmentId: string): number {
    return this.relationshipService.getCoursesForDepartment(departmentId).length;
  }
}