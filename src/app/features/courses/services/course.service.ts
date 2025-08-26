import { Injectable, signal } from '@angular/core';
import { Course, CreateCourseRequest, UpdateCourseRequest } from '../models/course.model';
import { AuthService } from '@core/services';
import { EntityRelationshipService } from '@core/services/entity-relationship.service';
import { UserRole } from '@features/users/models/user.model';
import { UserService } from '@features/users/services/user.service';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private courses = signal<Course[]>([])

  public readonly courses$ = this.courses.asReadonly(); //GetAllCourses

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private relationshipService: EntityRelationshipService
  ){
    this.loadCoursesFromStorage();
  }

  getAllCourses(): Promise<Course[]>{

    return new Promise((resolve,reject) => {

      setTimeout(() => {
        resolve(this.courses());
        reject('No hay cursos registrados')
      }, 300)
    })

  }

  getCourseById(id: string): Promise<Course | undefined> {

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const courseById = this.courses().find(c => c.id === id);
      if(!courseById){
        reject('Curso no encontrado');
        return;
      }
      resolve(courseById);
      }, 300)
      
    });
  }

  createCourse(course : CreateCourseRequest) : {success: boolean, message: string}{

    if(
      !course.name ||
      !course.code ||
      !course.description ||
      !course.imageUrl ||
      !course.maxStudents ||
      !course.departmentId ||
      !course.professorId ||
      !course.credits
    ){
      return {
        success: false,
        message: 'Todos los campos son obligatorios'
      }
    }

    if(this.courses().some(c => c.name.toLowerCase() === course.name.toLowerCase())){
      return {
        success: false,
        message: 'El nombre del curso ya existe'
    };
    }

    if (!this.isValidProfessor(course.professorId)) {
      return {
          success: false,
          message: 'El profesor seleccionado no existe'
      };
  }

  if (!this.isValidDepartment(course.departmentId)) {
    return {
        success: false,
        message: 'El departamento seleccionado no existe'
    };
}

  const codeExist = this.courses().some( c => c.code === course.code)

    if(!this.isValidCodeFormat(course.code)){

      if(codeExist){
        return {
          success: false,
          message: 'El código del curso ya existe.'
        }
      }

      return {
        success: false,
        message: 'El código del curso debe tener el formato XXX-000 (3 letras mayúsculas, guión, 3 dígitos)'
      }

    }

    if(!this.isValidImageUrl(course.imageUrl)){
      return {
        success: false,
        message: 'Debe ingresar una dirección URL válida.'
      }
    }

    const coursesLength = this.courses()
    const maxId = this.courses().length > 0 ? Math.max(...coursesLength.map(c => Number(c.id))) : 0;
    const id = (maxId + 1).toString();

    const newCourse: Course = {
      id,
      name: course.name,
      code: course.code,
      description: course.description,
      imageUrl: course.imageUrl,
      maxStudents: course.maxStudents,
      departmentId: course.departmentId,
      professorId: course.professorId,
      credits: course.credits
      
    }

    const updateCourses = [...this.courses(), newCourse];
    this.courses.set(updateCourses);
    this.saveCoursesToStorage();
    
    // Registrar la relación curso-departamento
    this.relationshipService.registerCourseWithDepartment(id, course.departmentId);

    return {
      success: true,
      message: 'Curso creado exitosamente.'
    }

  }

  updateCourse(id: string, course : UpdateCourseRequest) : {success: boolean, message: string}{
    
    const isStudent = this.authService.isStudent();
    const courses = this.courses();
    const courseIndex = courses.findIndex(c => c.id === id)

    if(isStudent){
      return {
        success: false,
        message: 'No tiene permisos para realizar esta acción'
      }
    }

    if(courseIndex === -1){
      return {
        success: false,
        message: 'Curso no encontrado'
      }
    }

    const originalCourse = courses[courseIndex];
    
    // Actualizar la relación si cambió el departamento
    if (course.departmentId && course.departmentId !== originalCourse.departmentId) {
      this.relationshipService.updateCourseDepartment(
        id, 
        originalCourse.departmentId, 
        course.departmentId
      );
    }

    //Validamos que el nombre del curso no exista
    if (course.name && course.name.toLowerCase() !== originalCourse.name.toLowerCase() && course.id !== originalCourse.id) {
      const nameTaken = courses.some(c =>
        c.name.toLowerCase() === course.name!.toLowerCase() && c.id !== originalCourse.id
      );
      if (nameTaken) {
        return { 
          success: false, 
          message: 'El nombre del curso ya existe' };
      }
    }

      //Validamos que el código del curso no existe 

// Validar cambio de código
if (course.code && course.code !== originalCourse.code) {
  // Formato
  if (!this.isValidCodeFormat(course.code)) {
    return {
      success: false,
      message: 'El código del curso debe tener el formato XXX-000 (3 letras mayúsculas, guión, 3 dígitos)'
    };
  }

  // Unicidad (excluyendo el curso actual)
  const codeTaken = courses.some(c =>
    c.code.toLowerCase() === course.code!.toLowerCase() && c.id !== originalCourse.id
  );
  if (codeTaken) {
    return { 
      success: false, 
      message: 'El código del curso ya existe' };
  }
}

  if(course.maxStudents &&
    originalCourse.studentInCourse &&
    course.maxStudents < originalCourse.studentInCourse){
      return {
        success: false,
        message: 'No puedes colocar una cantidad máxima de estudiantes menor a la cantidad de estudiantes que se encuentran registrados en el curso.'
      }
      
  }



      //Mezclamos datos antiguos y nuevos
      
      const updateCourse: Course = {
        ...originalCourse,
        ...course
      }

      const updatedCourses = courses.map(c => (c.id === course.id ? updateCourse : c));

      this.courses.set(updatedCourses);
      this.saveCoursesToStorage();

      return {
        success: true,
        message: 'Curso actualizado exitosamente.'
    }
    
  }

  deleteCourse(id: string) : {success: boolean, message: string}{

    const isStudent = this.authService.isStudent();

    const courseExist = this.courses().find(c => c.id === id);

     if(isStudent){
      return {
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      }

     }

     if(!courseExist){
      return{
        success: false,
        message: 'El curso no existe'
      }
     }

     const courseToDelete = this.courses().find(c => c.id === id);
     if (courseExist) {
       // Eliminar la relación curso-departamento
       this.relationshipService.removeCourseFromDepartment(id, courseExist.departmentId);
     }
     
     const updateCourses = this.courses().filter(c => c.id !== id)
     this.courses.set(updateCourses);
     this.saveCoursesToStorage();

     return {
      success: true,
      message: 'Curso eliminado exitosamente'
     }

  }




  private loadCoursesFromStorage() {

    try {
      const courseStore = localStorage.getItem('courses')

      if(courseStore){
        const courseJson = JSON.parse(courseStore);
        this.courses.set(courseJson);
      } 
    } catch (error) {
      console.error('Error al cargar los cursos desde el storage: ',error);
      localStorage.removeItem('courses');
      
    }


  }

  private saveCoursesToStorage(): void {

    try {
      localStorage.setItem('courses', JSON.stringify(this.courses()))
    } catch (error) {
      console.error('Error al guardar el curso en el storage: ', error);
      
    }

    
  }


  private isValidCodeFormat(code: string): boolean {
    const codeRegex = /^[A-Z]{3}-\d{3}$/;
    
    return codeRegex.test(code);
  }

  private isValidImageUrl(url: string): boolean {
    const urlRegex = /^(http|https):\/\/[^ "]+$/;
   return urlRegex.test(url);
  }

  private isValidProfessor(professorId: string): boolean {
    // Obtener usuarios con rol PROFESSOR
    const professors = this.userService.users$().filter(u => u.role === UserRole.PROFESSOR);
    return professors.some(p => p.id === professorId);
}

  private isValidDepartment(departmentId: string): boolean {
  // Verificamos si el departamento existe en las relaciones
  const departmentIds = Array.from(localStorage.getItem('departments') ? 
    JSON.parse(localStorage.getItem('departments')!).map((d: any) => d.id) : 
    []);
  return departmentIds.includes(departmentId);
}





  
}
