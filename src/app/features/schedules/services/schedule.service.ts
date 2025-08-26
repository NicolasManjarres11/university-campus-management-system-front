import { Injectable, signal } from '@angular/core';
import { Schedule, CreateScheduleRequest, UpdateScheduleRequest } from '../models/schedule.model';
import { AuthService } from '@core/services';
import { CourseService } from '@features/courses/services/course.service';
import { UserRole } from '@features/users/models/user.model';
import { UserService } from '@features/users/services/user.service';
import { EnrollmentService } from '@features/courses/services/enrollment.service';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private schedules = signal<Schedule[]>([]);
  public readonly schedules$ = this.schedules.asReadonly();

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private userService: UserService,
    private enrollmentService: EnrollmentService
  ) {
    this.loadFromStorage();
  }

  // Visualización según usuario actual

  getAllSchedules(): Promise<Schedule[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.schedules());
      }, 250);
    });
  }
  
  getSchedules(): Promise<Schedule[]> {
    return new Promise(async (resolve) => {
      try {
        const currentUser = this.authService.user();
        if (!currentUser) {
          resolve([]);
          return;
        }

        if (currentUser.role === UserRole.ADMIN) {
          resolve(this.schedules());
          return;
        }

        if (currentUser.role === UserRole.PROFESSOR) {
          resolve(this.schedules().filter(s => s.professorId === currentUser.id));
          return;
        }

        // STUDENT - Solo ver horarios de cursos en los que está inscrito
        if (currentUser.role === UserRole.STUDENT) {
          const myEnrollments = await this.enrollmentService.getMyEnrollments();
          const enrolledCourseIds = myEnrollments.map(e => e.courseId);
          resolve(this.schedules().filter(s => enrolledCourseIds.includes(s.courseId)));
          return;
        }

        resolve([]);
      } catch (error) {
        console.error('Error al obtener horarios:', error);
        resolve([]);
      }
    });
  }

  // Obtener por id
  getScheduleById(id: string): Promise<Schedule | undefined> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const schedule = this.schedules().find(s => s.id === id);
        if (!schedule) {
          reject('Horario no encontrado');
          return;
        }
        resolve(schedule);
      }, 250);
    });
  }

  // Crear horario
  createSchedule(data: CreateScheduleRequest): { success: boolean; message: string } {
    if (
      !data.courseId || 
      !data.professorId || 
      !data.schedule || 
      data.schedule.trim().length === 0) {
      return { 
        success: false, 
        message: 'Todos los campos son obligatorios.' };
    }

    // Validar curso y profesor
    const courseExists = this.courseExists(data.courseId);
    if (!courseExists) {
      return { 
        success: false, 
        message: 'El curso indicado no existe.' };
    }

    const professorIsValid = this.professorExists(data.professorId);
    if (!professorIsValid) {
      return { 
        success: false, 
        message: 'El profesor indicado no existe.' };
    }

    // Permisos
    const currentUser = this.authService.user();
    if (!currentUser) {
      return { 
        success: false, 
        message: 'No autenticado.' };
    }
    const isAdmin = currentUser.role === UserRole.ADMIN;
    const isProfessorSelf = currentUser.role === UserRole.PROFESSOR && currentUser.id === data.professorId;
    if (!isAdmin && !isProfessorSelf) {
      return { 
        success: false, 
        message: 'No tienes permisos para asignar horarios.' };
    }

    // Generación del ID
    const list = this.schedules();
    const maxId = list.length > 0 ? Math.max(...list.map(s => Number(s.id))) : 0;
    const id = (maxId + 1).toString();

    const newSchedule: Schedule = {
      id,
      courseId: data.courseId,
      professorId: data.professorId,
      schedule: data.schedule.trim()
    };

    this.schedules.set([...list, newSchedule]);
    this.saveToStorage();

    return { 
      success: true, 
      message: 'Horario creado exitosamente.' };
  }

  // Actualizar horario 
  updateSchedule(id: string, schedule: UpdateScheduleRequest): { success: boolean; message: string } {
    const schedules = this.schedules();
    const index = schedules.findIndex(s => s.id === id);

    const currentUser = this.authService.user();
    if (!currentUser) {
      return { 
        success: false, 
        message: 'No autenticado.' };
    }


    if (index === -1) {
      return { 
        success: false, 
        message: 'Horario no encontrado.' 
      };
    }



    const original = schedules[index];

    
    const nextCourseId = schedule.courseId ?? original.courseId;
    const nextProfessorId = schedule.professorId ?? original.professorId;
    const nextSchedule = (schedule.schedule ?? original.schedule).trim();

    if (!this.courseExists(nextCourseId)) {
      return { 
        success: false, 
        message: 'El curso indicado no existe.' };
    }
    if (!this.professorExists(nextProfessorId)) {
      return { 
        success: false, 
        message: 'El profesor indicado no existe.' };
    }
    if (nextSchedule.length === 0) {
      return { 
        success: false, 
        message: 'La cadena de horario es obligatoria.' };
    }

    // Permisos

    const isAdmin = currentUser.role === UserRole.ADMIN;
    const isProfessorSelf = currentUser.role === UserRole.PROFESSOR && currentUser.id === nextProfessorId;
    if (!isAdmin && !isProfessorSelf) {
      return { 
        success: false, 
        message: 'No tienes permisos para actualizar este horario.' };
    }

    const updated: Schedule = {
      ...original,
      courseId: nextCourseId,
      professorId: nextProfessorId,
      schedule: nextSchedule
    };

    const nextList = schedules.map(s => (s.id === id ? updated : s));
    this.schedules.set(nextList);
    this.saveToStorage();

    return { 
      success: true, 
      message: 'Horario actualizado exitosamente.' };
  }

  // Eliminar horario 
  deleteSchedule(id: string): { success: boolean; message: string } {

    const currentUser = this.authService.user();
    if (!currentUser) {
      return { 
        success: false, 
        message: 'No autenticado.' };
    }

    const schedules = this.schedules();
    const existing = schedules.find(s => s.id === id);
    if (!existing) {
      return { 
        success: false, 
        message: 'Horario no encontrado.' };
    }



    const isAdmin = currentUser.role === UserRole.ADMIN;
    const isProfessorSelf = currentUser.role === UserRole.PROFESSOR && currentUser.id === existing.professorId;
    if (!isAdmin && !isProfessorSelf) {
      return { 
        success: false, 
        message: 'No tienes permisos para eliminar este horario.' };
    }

    this.schedules.set(schedules.filter(s => s.id !== id));
    this.saveToStorage();
    return { success: true, message: 'Horario eliminado exitosamente.' };
  }

  


  private loadFromStorage(): void {
    try {
      const schedules = localStorage.getItem('schedules');
      if (schedules) {
        const schedulesList = JSON.parse(schedules);
        this.schedules.set(schedulesList);
      }
    } catch (error) {
      console.error('Error al cargar los horarios desde el storage:', error);
      localStorage.removeItem('schedules');
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('schedules', JSON.stringify(this.schedules()));
    } catch (error) {
      console.error('Error al guardar los horarios en el storage:', error);
    }
  }

  
  private courseExists(courseId: string): boolean {
    try {
      const courses = localStorage.getItem('courses');
      if (!courses) return false;
      const list = JSON.parse(courses) as Array<{ id: string }>;
      return list.some(c => c.id === courseId);
    } catch {
      return false;
    }
  }

  private professorExists(professorId: string): boolean {
    try {
      const professor = this.userService.users$();
      return professor.some(p => p.id === professorId && p.role === UserRole.PROFESSOR);
    } catch {
      return false;
    }
  }
}
