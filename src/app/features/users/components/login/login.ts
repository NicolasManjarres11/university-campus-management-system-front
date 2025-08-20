import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services';
import { User, UserRole } from '@features/users/models/user.model';
import { Loading } from '@shared/components';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, Loading],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  error = signal<string | null>(null);
  loading = signal<boolean>(true);

  loginForm = new FormGroup({
    username: new FormControl<string>('', Validators.required),
    password: new FormControl<string>('', Validators.required)
  })


  constructor(private router: Router,
              private authService: AuthService
  ){



  }

  ngOnInit(): void {

    setTimeout(() => {
      this.loading.set(false);
    }, 1500)

    this.authService.logout();
    this.initTestUsers();
  }

  private initTestUsers(): void {
    // Verificar si ya existen usuarios en localStorage
    const existingUsers = localStorage.getItem('users');
    if (!existingUsers) {
      // Crear usuarios de prueba
      const testUsers: User[] = [
        {
          id: '1',
          name: 'Admin',
          lastname: 'User',
          email: 'admin@devsenior.edu.co',
          username: 'admin',
          password: 'admin123',
          role: UserRole.ADMIN
        },
        {
          id: '2',
          name: 'Profesor',
          lastname: 'Test',
          email: 'profesor@devsenior.edu.co',
          username: 'profesor',
          password: 'profesor123',
          role: UserRole.PROFESSOR
        },
        {
          id: '3',
          name: 'Estudiante',
          lastname: 'Prueba',
          email: 'estudiante@devsenior.edu.co',
          username: 'estudiante',
          password: 'estudiante123',
          role: UserRole.STUDENT
        }
      ];

      // Guardar en localStorage
      localStorage.setItem('users', JSON.stringify(testUsers));
      console.log('Usuarios de prueba inicializados correctamente');
    }
  }

  onSubmit(): void{
    if(this.loginForm.invalid){
      this.error.set('Debes completar los campos correctamente.')
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    //Guardamos los valores del formulario
    const {username, password} = this.loginForm.value;

    const auth = this.authService.login(username || '', password || '');

    this.loading.set(false);

    if(auth.success){
      this.router.navigateByUrl('/home')
    } else {
      this.error.set(auth.message);
    }


  }

}
