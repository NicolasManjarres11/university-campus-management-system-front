import { computed, Injectable, signal } from '@angular/core';
import { User, UserRole } from '../../features/users/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //Signal para el usuario actual
  private currentUser = signal<User | null>(null);

  //Signal de solo lectura 
  public readonly user = this.currentUser.asReadonly();

  //Validar si el usuario está logueado, se actualiza automáticamente
  public isLoggedIn = computed(() => this.currentUser() !== null);

  //Obtener rol de usuario
  public userRole = computed(() => this.currentUser()?.role || null);

  constructor(){
    this.loadUserFromStorage();
  }

  //Métodos de autenticación

  login(username: string, password: string): {success: boolean; message: string} {
    try {
      //Obtenemos los usuarios desde el localStorage

      const storeUser = localStorage.getItem('users');

      if(!storeUser){
        return {
          success: false,
          message: 'No hay usuarios registrados'
        }
      }

      //Guardamos los usuarios obtenidos en una lista de usuarios

      const users: User[] = JSON.parse(storeUser);

      //Buscamos el usuario en la base de datos

      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

      if(!user){
        return {
          success: false,
          message: 'Usuario no encontrado.'
        }
      }

      if(user?.password !== password){
        return {
          success: false,
          message: 'Contraseña incorrecta. Inténtalo de nuevo.'
        }
      }

      //Guardamos el usuario en el LocalStorage

      const userWithoutPassword = {...user}; //Traemos todas las propiedades del usuario encontrado
      delete userWithoutPassword.password; //Eliminamos la contraseña para guardar el usuario logueado en el localStorage, conservamos las demás propiedades

  
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword)); //Guardamos el usuario en el localStorage
      this.currentUser.set(userWithoutPassword); //Lo guardamos en la signal del servicio.

      return {
        success: true,
        message: 'Se ha iniciado sesión exitosamente.'
      }

    } catch (error) {

      console.error('Error durante el login: ', error);
      return {
        success: false,
        message: 'Error interno del sistema.'
      }
      
    }
  }

  //Çierre de sesión
  //Se elimina la sesión del usuario del localStorage y se limpia signal del servicio

  logout(): void {

    localStorage.removeItem('currentUser');
    this.currentUser.set(null);


  }

  //Métodos de verificación de permisos
  //Esto es para validar los permisos del usuario y con esto, poder mostrar u ocultar componentes o elementos de laágina según el rol que tengan.

  hasRole(role : UserRole): boolean {

    return this.userRole() === role;
  }

  isAdmin(): boolean{

    return this.userRole() === UserRole.ADMIN;

  }
  isProfessor(): boolean{

    return this.userRole() === UserRole.PROFESSOR;

  }
  isStudent(): boolean{

    return this.userRole() === UserRole.STUDENT;
  }

  private loadUserFromStorage(): void {
    try {

      const storeUser = localStorage.getItem('currentUser'); //Obtenemos del localStorage el item currenUser
      if(storeUser){
        const user =JSON.parse(storeUser); //Si hay, lo pasamos de string a JSON
        this.currentUser.set(user); //Actualizamos la Signal con el usuario cargado , //Las Signal computadas se activan
      }
      
    } catch (error) {
      console.error('Error cargando el usuario desde el storage: ', error);
      localStorage.removeItem('currentUser')
    }
  }
  
}
