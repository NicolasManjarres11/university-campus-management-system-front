import { Component, effect, input, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services';
import { CreateUserRequest, User, UserRole } from '@features/users/models/user.model';
import { UserService } from '@features/users/services/user.service';
import { Loading } from '@shared/components';

@Component({
  selector: 'app-form-user',
  standalone: true,
  imports: [ReactiveFormsModule, Loading, RouterLink],
  templateUrl: './form.user.html',
  styleUrl: './form.user.css'
})
export class FormUser {

  userId = input<string | null>(null);
  error = signal<string | null>(null);
  loading = signal<boolean>(true);
  passwordError = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showSuccess = signal<boolean>(false);
  isEditMode = signal<boolean>(false);

  passwordMatchValidator(control : AbstractControl) {
    const password = control.get('password')
    const confirmPassword = control.get('confirm-password')

    if(!password || !confirmPassword){
      return null;
    }

    return password.value === confirmPassword.value ? null : {passwordMismatch: true};
  }

  userForm = new FormGroup({
    name: new FormControl<string>('', Validators.required),
    lastname: new FormControl<string>('', Validators.required),
    email: new FormControl<string>('', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]),
    username: new FormControl<string>('', Validators.required),
    password: new FormControl<string>('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl<string>('', Validators.required),
    role: new FormControl<UserRole>(UserRole.STUDENT, Validators.required)
  })

  constructor(private route: Router,
    private userService: UserService,
    private authService: AuthService) {

      effect(() => {

        if(this.userId()){
          this.loading.set(true)
          this.isEditMode.set(true)
          this.error.set(null)

          const id = this.userId() ?? "0";

          this.userService.getUserById(id)
          .then((data) => {
            // Asegurarse de que el rol sea un valor del enum UserRole
            const formData = {
              ...data,
              role: data!.role as UserRole  // Asegurar que se trate como UserRole
            };
            
            // Eliminar confirmPassword si existe en data pero no en el formulario
            if ('confirmPassword' in formData) {
              delete formData.confirmPassword;
            }
            
            this.userForm.patchValue(formData);
            this.loading.set(false);
          })
          .catch(error => {
            this.error.set(error);
            this.loading.set(false);
          });

        } else {
          this.isEditMode.set(false);
          this.loading.set(false);
        }

      })

      this.userForm.get('password')?.valueChanges.subscribe(() => {
        // Si confirmPassword ya ha sido tocado, validar en tiempo real
        if (this.userForm.get('confirmPassword')?.touched) {
          this.validatePasswords();
        }
      });
      
      this.userForm.get('confirmPassword')?.valueChanges.subscribe(() => {
        this.validatePasswords();
      });
    
  }



    //Metodo para validar que las contraseñas coincidan

    validatePasswords(): void {
      const password = this.userForm.get('password')?.value;
      const confirmPassword = this.userForm.get('confirmPassword')?.value;
      
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
      if(this.userForm.invalid){
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
        password,
        role
      } = this.userForm.value;
  
      const registerData: CreateUserRequest = {
        name: name || '',
        lastname: lastname || '',
        email: email || '',
        username: username || '',
        password: password || '',
        role: role ? (role as UserRole) : UserRole.STUDENT
      };
  
      const resultCreate = this.userService!.createUser(registerData);
  
      this.loading.set(false);
  
      if(resultCreate.success){
        this.successMessage.set(resultCreate.message);
        this.showSuccess.set(true)
        setTimeout(() => {
          this.route.navigate(['/users'])
        }, 3000)
        
      } 
  
      else{
        this.error.set(resultCreate.message)
      }
  
    }

    onUpdate(){

      this.loading.set(true);
      this.error.set(null);
      this.passwordError.set(null)
      this.successMessage.set(null);
      this.showSuccess.set(false);

      const id = this.userId();
      const user : User = this.userForm.value as User;

      const resultUpdate = this.userService.updateUser(id!, user)

      this.loading.set(false);

      if(resultUpdate.success){
        this.successMessage.set(resultUpdate.message)
        this.showSuccess.set(true)
        setTimeout(() => {
          this.route.navigate(['/users'])
        }, 3000)
      }
      else{
        this.error.set(resultUpdate.message)
      }

    }




}
