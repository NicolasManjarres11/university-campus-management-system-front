import { Injectable, signal } from '@angular/core';
import { Department, CreateDepartmentRequest, UpdateDepartmentRequest } from '../models/department.model';
import { AuthService } from '@core/services';
import { CourseService } from '@features/courses/services/course.service';
import { UserRole } from '@features/users/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  private departments = signal<Department[]>([]);
  public readonly departments$ = this.departments.asReadonly();

  constructor(
    private authService: AuthService,
    private courseService : CourseService
  ) {
    this.loadDepartmentsFromStorage();
  }

  getAllDepartments(): Promise<Department[]>{
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(this.departments());
        reject('No hay departamentos registrados.')
      }, 300)
    })
  }

  searchDepartments(query: string): Promise<Department[]>{
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(
          this.departments().filter(d => d.name.includes(query))
        )
      }, 300)
    })
  }

  // Obtener departamento por ID
  getDepartmentById(id: string): Promise<Department | undefined>  {

    const department = this.departments().find(d => d.id === id);

    return new Promise((resolve, reject) => {

      if(!department){
        reject('No se ha encontrado el departamento con el id: ' + id)
        return;
      }

      resolve(department);

    })

 
  }

  // Crear departamento (solo admins)
  createDepartment(department: CreateDepartmentRequest): { success: boolean; message: string } {
    const currentUser = this.authService.user();

    if (currentUser?.role !== UserRole.ADMIN) {
      return {
        success: false,
        message: 'Solo los administradores pueden crear departamentos.'
      };
    }

    // Validar campos requeridos
    if (!department.name || !department.description) {
      return {
        success: false,
        message: 'Todos los campos son obligatorios.'
      };
    }

    // Validar unicidad del nombre
    if (this.departments().some(d => d.name.toLowerCase() === department.name.toLowerCase())) {
      return {
        success: false,
        message: 'Ya existe un departamento con ese nombre.'
      };
    }

    // Generar ID
    const maxId = this.departments().length > 0 
      ? Math.max(...this.departments().map(d => Number(d.id))) 
      : 0;
    const id = (maxId + 1).toString();

    // Crear nuevo departamento
    const newDepartment: Department = {
      id,
      name: department.name,
      description: department.description
    };

    // Actualizar Signal y persistir
    const updatedDepartments = [...this.departments(), newDepartment];
    this.departments.set(updatedDepartments);
    this.saveDepartmentsToStorage();

    return {
      success: true,
      message: 'Departamento creado exitosamente.'
    };
  }

  // Actualizar departamento
  updateDepartment(id: string, department: UpdateDepartmentRequest): { success: boolean; message: string } {
    const currentUser = this.authService.user();

    if (currentUser?.role !== UserRole.ADMIN) {
      return {
        success: false,
        message: 'Solo los administradores pueden actualizar departamentos.'
      };
    }

    const departments = this.departments();
    const departmentIndex = departments.findIndex(d => d.id === id);

    if (departmentIndex === -1) {
      return {
        success: false,
        message: 'Departamento no encontrado.'
      };
    }

    const originalDepartment = departments[departmentIndex];

    // Validar unicidad del nombre si cambió
    if (department.name && 
        department.name !== originalDepartment.name &&
        departments.some(d => d.name.toLowerCase() === department.name!.toLowerCase() &&
        d.id !== originalDepartment.id  
      )) {
      return {
        success: false,
        message: 'Ya existe un departamento con ese nombre.'
      };
    }

    // Actualizar departamento
    const updatedDepartment: Department = {
      ...originalDepartment,
      ...department
    };

    const updatedDepartments = departments.map(d => 
      d.id === id ? updatedDepartment : d
    );

    this.departments.set(updatedDepartments);
    this.saveDepartmentsToStorage();

    return {
      success: true,
      message: 'Departamento actualizado exitosamente.'
    };
  }

  // Eliminar departamento
  deleteDepartment(id: string): { success: boolean; message: string } {
    const currentUser = this.authService.user();

    if (currentUser?.role !== 'admin') {
      return {
        success: false,
        message: 'Solo los administradores pueden eliminar departamentos.'
      };
    }

    const department = this.departments().find(d => d.id === id);
    const courseEnrolled = this.courseService.courses$().some(c => c.departmentId === id)

    if (!department) {
      return {
        success: false,
        message: 'Departamento no encontrado.'
      };
    }

    if(courseEnrolled){
      return {
        success: false,
        message: 'No puedes eliminar este departamento ya que tiene uno o más cursos registrados.'
      }
    }

    

    const updatedDepartments = this.departments().filter(d => d.id !== id);
    this.departments.set(updatedDepartments);
    this.saveDepartmentsToStorage();

    return {
      success: true,
      message: 'Departamento eliminado exitosamente.'
    };
  }



  private loadDepartmentsFromStorage(): void {
    try {
      const storedDepartments = localStorage.getItem('departments');
      if (storedDepartments) {
        const departments: Department[] = JSON.parse(storedDepartments);
        this.departments.set(departments);
      }
    } catch (error) {
      console.error('Error cargando departamentos desde localStorage:', error);
      localStorage.removeItem('departments');
    }
  }

  private saveDepartmentsToStorage(): void {
    try {
      localStorage.setItem('departments', JSON.stringify(this.departments()));
    } catch (error) {
      console.error('Error guardando departamentos en localStorage:', error);
    }
  }
} 