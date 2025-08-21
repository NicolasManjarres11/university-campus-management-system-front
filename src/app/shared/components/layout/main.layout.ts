import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services';
import { UserService } from '@features/users/services/user.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main.layout.html',
  styleUrl: './main.layout.css'
})
export class MainLayout {

  userId = signal<string | undefined>('')
  authService = inject(AuthService)

  constructor(private route : Router, private userService: UserService){
   
  }

  ngOnInit(): void {
    
    this.userId.set(this.authService.user()?.id)
    
  }

  logout(): void {
    this.authService.logout();
    this.route.navigateByUrl('/login')
  }
}
