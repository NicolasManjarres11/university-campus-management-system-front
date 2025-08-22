import { Course } from "@features/courses/models/course.model";

export enum UserRole{
    STUDENT = 'student',
    PROFESSOR = 'professor',
    ADMIN = 'admin'
}

export interface User {
    id: string;
    name: string;
    lastname: string;
    email: string;
    username: string;
    password?: string; //Se deja opcional, ya que no siempre requerimos la contraseña, por ejemplo, para mostrar una lista de usuarios
    courses?: Course[]
    role: UserRole;


}

//Tipo adicioal para la creación y registro de usuario

export type RegisterUserRequest = Omit<User, 'id' | 'role'>


export type CreateUserRequest = Omit<User, 'id'>;

//Tipo adicional para actualizar un usuario
//Con Partial hacemos que todas las propiedades sean opcionales
//Luego agregamos de vuelta la propiedad id como requerida, esto para saber qué usuario se va a actualizar

export type UpdateUserRequest = Partial<Omit<User, 'id'>> & {id: string};

//Tipo adicional de usuario sin password

export type UserWithoutPassword = Omit<User, 'password'>;

//Lista de usuarios

export type UserListResponse = UserWithoutPassword[];
