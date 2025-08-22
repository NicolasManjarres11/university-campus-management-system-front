export interface Course {
    id: string;
    name: string;
    code: string;
    description: string;
    imageUrl: string;
    maxStudents: number;
    studentInCourse?: number;
    departmentId: string;
    professorId: string;
    credits: number;

}

//Tipo adicional para crear un curso

export type CreateCourseRequest = Omit<Course, 'id' | 'studentInCourse'>

//Tipo adicional para actualizar un curso

export type UpdateCourseRequest = Partial<Omit<Course,'id'>> & {id: string};

//Lista de cursos

export type CourseListResponse = Course[];