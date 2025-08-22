import { Injectable, signal } from '@angular/core';
import { Grade, CreateGradeRequest, UpdateGradeRequest } from '../models/grade.model';
import { AuthService } from '@core/services';
import { UserRole } from '@features/users/models/user.model';

@Injectable({ providedIn: 'root' })
export class GradeService {
  private grades = signal<Grade[]>([]);
  public readonly grades$ = this.grades.asReadonly();

  constructor(private authService: AuthService) {
    this.loadFromStorage();
  }


  getGradesForCurrentUser(enrolledCourseIds?: string[]): Promise<Grade[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = this.authService.user();
        if (!currentUser) {
          resolve([]);
          return;
        }
        if (currentUser.role === UserRole.ADMIN) {
          resolve(this.grades());
          return;
        }
        if (currentUser.role === UserRole.PROFESSOR) {
          resolve(this.grades().filter(g => g.professorId === currentUser.id));
          return;
        }
        // STUDENT
        let result = this.grades().filter(g => g.studentId === currentUser.id);
        if (Array.isArray(enrolledCourseIds) && enrolledCourseIds.length > 0) {
          result = result.filter(g => enrolledCourseIds.includes(g.courseId));
        }
        resolve(result);
      }, 200);
    });
  }

  // Por curso
  getGradesByCourseId(courseId: string): Promise<Grade[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(this.grades().filter(g => g.courseId === courseId)), 150);
    });
  }

  // Crear calificación
  createGrade(data: CreateGradeRequest): { success: boolean; message: string } {

    const currentUser = this.authService.user();

    if(!currentUser){
        return{
            success: false,
            message: 'No autenticaco.'
        }
    }
    if (!data.courseId || !data.professorId || !data.studentId || data.grade === undefined || data.grade === null) {
      return { success: false, message: 'Todos los campos son obligatorios.' };
    }

    if (!this.isValidScore(data.grade)) {
      return { success: false, message: 'La calificación debe estar entre 0 y 100.' };
    }

    
    if (!currentUser || currentUser.role !== UserRole.PROFESSOR) {
      return { success: false, message: 'Solo los profesores pueden registrar calificaciones.' };
    }

    if (currentUser.id !== data.professorId) {
      return { success: false, message: 'No puedes registrar calificaciones en nombre de otro profesor.' };
    }

    if (!this.isProfessorOfCourse(data.professorId, data.courseId)) {
      return { success: false, message: 'Solo el profesor asignado al curso puede registrar calificaciones.' };
    }

    // Evitar duplicado por curso/estudiante (una nota única por curso-estudiante)
    const exists = this.grades().some(g => g.courseId === data.courseId && g.studentId === data.studentId);
    if (exists) {
      return { success: false, message: 'Ya existe una calificación para este estudiante en este curso.' };
    }

    const list = this.grades();
    const maxId = list.length > 0 ? Math.max(...list.map(g => Number(g.id))) : 0;
    const id = (maxId + 1).toString();

    const newGrade: Grade = {
      id,
      courseId: data.courseId,
      professorId: data.professorId,
      studentId: data.studentId,
      grade: data.grade,
      comments: data.comments?.trim() || undefined
    };

    this.grades.set([...list, newGrade]);
    this.saveToStorage();

    return { success: true, message: 'Calificación registrada exitosamente.' };
  }

  // Actualizar calificación (solo profesor del curso)
  updateGrade(id: string, changes: UpdateGradeRequest): { success: boolean; message: string } {
    const list = this.grades();
    const index = list.findIndex(g => g.id === id);
    if (index === -1) {
      return { success: false, message: 'Calificación no encontrada.' };
    }

    const currentUser = this.authService.user();
    if (!currentUser || currentUser.role !== UserRole.PROFESSOR) {
      return { success: false, message: 'Solo los profesores pueden actualizar calificaciones.' };
    }

    const original = list[index];

    // No permitimos cambiar el profesor a otro distinto al que está logueado
    const nextProfessorId = original.professorId; // fijo
    if (currentUser.id !== nextProfessorId) {
      return { success: false, message: 'No tienes permisos para actualizar esta calificación.' };
    }

    // Si cambia el curso, validar que siga siendo profesor del curso
    const nextCourseId = changes.courseId ?? original.courseId;
    if (!this.isProfessorOfCourse(nextProfessorId, nextCourseId)) {
      return { success: false, message: 'Solo el profesor asignado al curso puede actualizar calificaciones.' };
    }

    const nextGrade = changes.grade ?? original.grade;
    if (!this.isValidScore(nextGrade)) {
      return { success: false, message: 'La calificación debe estar entre 0 y 100.' };
    }

    const updated: Grade = {
      ...original,
      courseId: nextCourseId,
      // professorId se mantiene
      grade: nextGrade,
      studentId: changes.studentId ?? original.studentId,
      comments: (changes.comments ?? original.comments)?.trim() || undefined
    };

    const nextList = list.map(g => (g.id === id ? updated : g));
    this.grades.set(nextList);
    this.saveToStorage();

    return { success: true, message: 'Calificación actualizada exitosamente.' };
  }

  // Eliminar calificación (solo profesor del curso)
  deleteGrade(id: string): { success: boolean; message: string } {
    const list = this.grades();
    const existing = list.find(g => g.id === id);
    if (!existing) {
      return { success: false, message: 'Calificación no encontrada.' };
    }

    const currentUser = this.authService.user();
    if (!currentUser || currentUser.role !== UserRole.PROFESSOR) {
      return { success: false, message: 'Solo los profesores pueden eliminar calificaciones.' };
    }

    if (!this.isProfessorOfCourse(currentUser.id, existing.courseId)) {
      return { success: false, message: 'No tienes permisos para eliminar esta calificación.' };
    }

    this.grades.set(list.filter(g => g.id !== id));
    this.saveToStorage();
    return { success: true, message: 'Calificación eliminada exitosamente.' };
  }

  // Persistencia
  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem('grades');
      if (raw) {
        const parsed: Grade[] = JSON.parse(raw);
        this.grades.set(parsed);
      }
    } catch (error) {
      console.error('Error al cargar calificaciones desde el storage:', error);
      localStorage.removeItem('grades');
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('grades', JSON.stringify(this.grades()));
    } catch (error) {
      console.error('Error al guardar calificaciones en el storage:', error);
    }
  }

  // Helpers
  private isValidScore(score: number): boolean {
    return Number.isFinite(score) && score >= 0 && score <= 100;
  }

  private isProfessorOfCourse(professorId: string, courseId: string): boolean {
    try {
      const raw = localStorage.getItem('courses');
      if (!raw) return false;
      const list = JSON.parse(raw) as Array<{ id: string; professorId: string }>;
      const course = list.find(c => c.id === courseId);
      return !!course && course.professorId === professorId;
    } catch {
      return false;
    }
  }
}
