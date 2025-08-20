import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Loading } from '@shared/components';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, Loading, RouterLink],
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users {


  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  users = signal<User[]>([]);
  successMessage = signal<string | null>(null);
  showSuccess = signal<boolean>(false);
  showDeleteConfirmation = signal<boolean>(false);
  userToDelete = signal<string | null>(null);

  constructor(private userService: UserService, private route: Router) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    // TRaemos los usuarios con el servicio
    this.userService.getAllUsers()
      .then(users => {
        this.users.set(users);
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
