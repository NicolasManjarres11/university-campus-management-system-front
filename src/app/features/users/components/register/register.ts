
import { Component, computed, effect, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services';
import { RegisterUserRequest } from '@features/users/models/user.model';
import { UserService } from '@features/users/services/user.service';
import { Loading } from '@shared/components';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, Loading],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  error = signal<string | null>(null);
  loading = signal<boolean>(true);
  passwordError = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showSuccess = signal<boolean>(false);
  
  
  

  passwordMatchValidator(control : AbstractControl) {
    const password = control.get('password')
    const confirmPassword = control.get('confirm-password')

    if(!password || !confirmPassword){
      return null;
    }

    return password.value === confirmPassword.value ? null : {passwordMismatch: true};
  }


  registerForm = new FormGroup({
    name: new FormControl<string>('', Validators.required),
    lastname: new FormControl<string>('', Validators.required),
    email: new FormControl<string>('', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]),
    username: new FormControl<string>('', Validators.required),
    password: new FormControl<string>('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl<string>('', Validators.required),
  })



  constructor(private route: Router,
              private userService: UserService,
              private authService: AuthService
  ){

    


        this.registerForm.get('password')?.valueChanges.subscribe(() => {
          // Si confirmPassword ya ha sido tocado, validar en tiempo real
          if (this.registerForm.get('confirmPassword')?.touched) {
            this.validatePasswords();
          }
        });
        
        this.registerForm.get('confirmPassword')?.valueChanges.subscribe(() => {
          this.validatePasswords();
        });


  }

  //Metodo para validar que las contrasñeas coincidan

  validatePasswords(): void {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    
    // Solo validar si ambos campos tienen valor
    if (confirmPassword) { // Validamos si el campo para confirmar está vacío
      if (password !== confirmPassword) {
        this.passwordError.set('Las contraseñas no coinciden.');
      } else {
        this.passwordError.set(null);
      }
    }
  }

  ngOnInit():void{

    setTimeout(() => {
      this.loading.set(false)

    },1500)
    
  }



  onSubmit(): void {
    if(this.registerForm.invalid){
      this.error.set('Debes completar los campos correctamente.')
      return;
    }

    

    this.loading.set(true);
    this.error.set(null);
    this.passwordError.set(null)
    this.successMessage.set(null);
    this.showSuccess.set(false);

    const {
      name,
      lastname,
      email,
      username,
      password
    } = this.registerForm.value;

    const registerData: RegisterUserRequest = {
      name: name || '',
      lastname: lastname || '',
      email: email || '',
      username: username || '',
      password: password || ''
    };

    const resultRegister = this.userService!.registerUser(registerData);

    this.loading.set(false);

    if(resultRegister.success){
      this.successMessage.set(resultRegister.message);
      this.showSuccess.set(true)
      setTimeout(() => {
        this.route.navigate(['/login'])
      }, 3000)
      
    } 

    else{
      this.error.set(resultRegister.message)
    }

  }

}
