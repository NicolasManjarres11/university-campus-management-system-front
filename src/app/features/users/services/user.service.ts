import { computed, Injectable, signal } from "@angular/core";
import { CreateUserRequest, RegisterUserRequest, UpdateUserRequest, User, UserRole } from "../models/user.model";
import { AuthService } from "@core/services"; //Importado desde archivo de barril

@Injectable({ providedIn: 'root' })
export class UserService{

    private users = signal<User[]>([]);
    

    public readonly users$ = this.users.asReadonly(); //getAllUsers

/*     public readonly filteredUsers = computed(() => {})

    private loading = signal<boolean | null>(null);

    private error = signal<string | null>(null); */

    constructor(private authService: AuthService){
        this.loadUsersFromStorage();
    }

    getAllUsers(): Promise<User[]> {
        const currentUser = this.authService.user();
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if(currentUser?.role !== UserRole.ADMIN){
                reject('No tienes permisos para realizar esta acción');
                return;
            }
            
            const users = this.users();
            if (users.length === 0) {
                reject('No hay usuarios registrados');
                return;
            }
            
            // Devolvemos los usuarios sin contraseñas

            const usersWithoutPasswords = users.map(user => {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword as User;
            });
            
            resolve(usersWithoutPasswords);
          }, 300);
        });
      }

    //Obtener usuario por ID

    getUserById(id: string): Promise<User | undefined> {
        const currentUser = this.authService.user();
        const userById = this.users().find(u => u.id === id);
        return new Promise((resolve, reject) => {
          if (currentUser?.role === UserRole.STUDENT && currentUser.id !== id) {
            reject('No tienes permisos para realizar esta acción');
            return;
          }
          if(!userById){
            reject('Usuario no encontrado');
            return;
          }

          resolve(userById);
        });
      }


    //Filtro de usuario


    //Registro de usuario

    registerUser(user: RegisterUserRequest): {success: boolean; message: string}{

        //Validacion de campos requeridos

        if(
            !user.name ||
            !user.lastname ||
            !user.username ||
            !user.password ||
            !user.email
        ){
            return {
                success: false,
                message: 'Todos los campos son obligatorios'
            }
        }

        //Validar formato de email
        if (!this.isValidEmailFormat(user.email)) {
            return {
                success: false,
                message: 'El email debe tener el formato correcto y pertenecer al dominio @devsenior.edu.co'
            }
        }



        if(this.validateUsername(user.username)){
            return {
                success: false,
                message: 'El nombre de usuario ya está registrado'
            }
        }
        if(this.validateEmail(user.email)){
            return {
                success: false,
                message: 'El correo electrónico ya está registrado'
            }
        }

        //Validar que la contraseña tenga una buena longitud

        if(user.password.length < 6){
            return {
                success: false,
                message: 'La contraseña debe tener más de 6 carácteres'
            }
        }

        //Generación del ID validando cuál es el mayor e ir sumando de a uno

        const usersLength = this.users()
        const maxId = this.users().length > 0 ? Math.max(...usersLength.map(u => Number(u.id))) : 0;
        const id = (maxId + 1).toString();


        //Construimos el nuevo usuario

        const newUser: User = {
            id,
            username: user.username,
            password: user.password,
            email: user.email,
            name: user.name,
            lastname: user.lastname,
            role: UserRole.STUDENT, //Rol de estudiante por defecto
        };

        const updateUsers = [...this.users(), newUser] //Agregamos el estudiante creado a la Signal del servicio, se descompone array y se agrega estudiante creado al final 
        this.users.set(updateUsers); //Enviamos data a la signal
        this.saveUsersToStorage(); //Guardamos en el localStorage

        return {
            success: true,
            message: 'Usuario registrado exitosamente.'
        }

    }



    //Creación de usuario

    createUser(user: CreateUserRequest): {success : boolean; message: string} {

        const currentUser = this.authService.user();

        if(currentUser?.role !== UserRole.ADMIN){
            return {
                success: false,
                message: 'No tienes permisos para realizar esta acción.'
            }
        }


        //Validacion de campos requeridos

        if(
            !user.username ||
            !user.password ||
            !user.email ||
            !user.name ||
            !user.lastname ||
            !user.role
        ){
            return {
                success: false,
                message: 'Todos los campos son obligatorios'
            }
        }

        //Validar formato de email
        if (!this.isValidEmailFormat(user.email)) {
            return {
                success: false,
                message: 'El email debe tener el formato correcto y pertenecer al dominio @devsenior.edu.co'
            }
        }

        


        if(this.validateUsername(user.username)){
            return {
                success: false,
                message: 'El nombre de usuario ya está registrado'
            }
        }
        if(this.validateEmail(user.email)){
            return {
                success: false,
                message: 'El correo electrónico ya está registrado'
            }
        }

        //Validar que la contraseña tenga una buena longitud

        if(user.password.length < 6){
            return {
                success: false,
                message: 'La contraseña debe tener más de 6 carácteres'
            }
        }

        //Generación del ID validando cuál es el mayor e ir sumando de a uno

        const usersLength = this.users()
        const maxId = this.users().length > 0 ? Math.max(...usersLength.map(u => Number(u.id))) : 0;
        const id = (maxId + 1).toString();


        //Construimos el nuevo usuario

        const newUser: User = {
            id,
            username: user.username,
            password: user.password,
            email: user.email,
            name: user.name,
            lastname: user.lastname,
            role: user.role || UserRole.STUDENT, //Rol de estudiante por defecto
        };

        const updateUsers = [...this.users(), newUser] //Agregamos el estudiante creado a la Signal del servicio, se descompone array y se agrega estudiante creado al final 
        this.users.set(updateUsers); //Enviamos data a la signal
        this.saveUsersToStorage(); //Guardamos en el localStorage

        return {
            success: true,
            message: 'Usuario creado exitosamente.'
        }
    }

    updateUser(id: string, user : UpdateUserRequest) : {success: boolean; message: string} {

        const currentUser = this.authService.user();

        //Restringimos la acción si el usuario no tiene permisos de administrador y si el id no coincide con el usuario logueado

        if(currentUser?.role !== UserRole.ADMIN &&
            currentUser?.id !== id
        ){

            return{
                success: false,
                message: 'No tienes permisos para realizar esta acción.'
            }
            
            
        }

        const users = this.users();


        
        const userIndex = users.findIndex(u => u.id === id); //Buscamos la posicion del usuarios


        


        if (!(userIndex > -1)) {
            return { 
                success: false, 
                message: 'Usuario no encontrado.' 
            };
        }

        const originalUser = users[userIndex];


        if (
            user.username && //Si hay un valor en username
            user.username !== originalUser.username && //Y si este valor es diferente al username que ya tenía el usuario
            users.some(u => u.username.toLowerCase() === user.username!.toLowerCase()) //Y si el nuevo username se encuentra otro igual en la lista
        ) {
            return { 
                success: false, 
                message: 'El nombre de usuario ya está en uso.' };
        }

        if (user.password !== undefined && user.password.trim() === '') {
            delete user.password; // Eliminar contraseña vacía para mantener la original
          }

          //Mezclamos datos antiguos y nuevos

        const updatedUser: User = {
            ...originalUser,
            ...user
        }

        
        
          //Creamos un nuevo array de usuarios con el usuario actualizado
          //Si el ID coincide, cambia el user existente por el actualizado
          //Si el ID no coincide, se mantiene el usuario existente

        const updatedUsers = users.map(u => (u.id === id ? updatedUser : u));

          //Actualizamos signal y Storage
        
        this.users.set(updatedUsers); //Actualizamos la signal del servicio
        this.saveUsersToStorage(); //Actualizamos el storage

        return {
            success: true,
            message: 'Usuario actualizado exitosamente.'
        }

    }

    //Eliminar usuario

    deleteUser(id: string): {success: boolean; message: string} {

        
        const currentUser = this.authService.user(); //Traemos el usuario autenticado
        const users= this.users(); //Traemos la lista de usuarios disponibles en el storage


        const userExist = users.find(u => u.id === id); //Revisamos si el usuario existe

        

        if(currentUser?.role === UserRole.STUDENT
        ){
            return {
                success: false,
                message: 'Solo los profesores y administradores pueden eliminar un usuario.'
            }
        }

        if(currentUser?.id === id){
            return{
                success: false,
                message: 'No puede eliminar su propio usuario'
            }
        }

        
        //Validamos si existe el usuario con el id relacionado
        if(!userExist){
            return {
                success: false,
                message: 'Usuario no encontrado.'
            }
        }

        

        const updateUsers = users.filter(u => u.id !== id);
        this.users.set(updateUsers);
        this.saveUsersToStorage();

        
        

        return {
            success: true,
            message: 'Usuario eliminado exitosamente.'
        }

    }

    //Cargar usuarios del storage

    private loadUsersFromStorage(): void {
        try {

            const storeUsers = localStorage.getItem('users');
            if(storeUsers){
                const usersJson : User[] = JSON.parse(storeUsers);
                this.users.set(usersJson);
            }
            
        } catch (error) {
            console.error('Error al cargar los usuarios desde el storage: ', error);
            localStorage.removeItem('users');
            
        }
    }

    //Guardar usuarios en el Storage

    private saveUsersToStorage(): void {
        try {
            localStorage.setItem('users', JSON.stringify(this.users()));

        } catch (error) {
            console.error('Error al guardar los usuarios en el storage: ', error);
            
            
        }
    }

    private validateEmail(email: string): boolean{
        return this.users().some(u => u.email === email)
    }

    private isValidEmailFormat(email: string): boolean {
        // Validar formato básico de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return false;
        }
        
        // Validar dominio específico @devsenior.edu.co
        return email.endsWith('@devsenior.edu.co');
    }

    private validateUsername(username: string): boolean{
        return this.users().some(u => u.username === username)
    }



}