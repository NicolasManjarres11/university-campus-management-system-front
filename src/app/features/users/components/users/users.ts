import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loading } from '@shared/components';
import { UserService } from '../../services/user.service';
import { User, UserRole } from '../../models/user.model';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, Loading, RouterLink, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users {


  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  users = signal<User[]>([]);
  allUsers = signal<User[]>([]);
  successMessage = signal<string | null>(null);
  showSuccess = signal<boolean>(false);
  showDeleteConfirmation = signal<boolean>(false);
  userToDelete = signal<string | null>(null);
  filter = signal<string>('');

  constructor(private userService: UserService, private route: Router) {

    effect(() => {
      if(!this.filter()){
        this.users.set(this.allUsers())
      } else {

        const searchTerm = this.filter().toLowerCase();

        const getRole = (role: UserRole): boolean => {
          switch(role){
            case UserRole.ADMIN:
              return this.filter().includes('admin');
              case UserRole.PROFESSOR:
                return this.filter().includes('profesor');
              case UserRole.STUDENT:
                return this.filter().includes('estudiante');
              default:
                return false;
          }
        }



        this.users.set(this.allUsers()
        .filter((u) => {
          // Concatenar nombre y apellido para la búsqueda
          const fullName = `${u.name} ${u.lastname}`.toLowerCase();          
          return fullName.includes(searchTerm) ||
                 u.email.toLowerCase().includes(searchTerm) ||
                 getRole(u.role as UserRole);
        })
      );
      }
    })
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    // TRaemos los usuarios con el servicio
    this.userService.getAllUsers()
      .then(data => {
        this.allUsers.set(data);
        this.users.set(this.allUsers());
        setTimeout(() => {
          this.loading.set(false);
        }, 800);
      })
      .catch(error => {
        console.error('Error al cargar usuarios:', error);
        this.error.set(typeof error === 'string' ? error : 'Error al cargar los usuarios');
        this.loading.set(false);
      });
  }

  confirmDelete(id: string): void {
    this.userToDelete.set(id);
    this.showDeleteConfirmation.set(true);
  }
  
  // Método para cancelar la eliminación
  cancelDelete(): void {
    this.userToDelete.set(null);
    this.showDeleteConfirmation.set(false);
  }

  deleteUsers(): void {
    if (!this.userToDelete()) return;
    
    this.loading.set(true);
    this.error.set(null);
    this.showDeleteConfirmation.set(false);
    
    const resultDelete = this.userService.deleteUser(this.userToDelete()!);
    
    if(resultDelete.success){
      this.successMessage.set(resultDelete.message);
      this.showSuccess.set(true);
      setTimeout(() => {
        this.showSuccess.set(false);
        this.loading.set(false);
        this.loadUsers();
      }, 3000);
    } else {
      this.error.set(resultDelete.message);
      this.loading.set(false);
    }
    
    this.userToDelete.set(null);
  }
}
