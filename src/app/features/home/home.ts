import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  
  authService = inject(AuthService);
  userId = signal<string | undefined>('');

  constructor(){

  }

  ngOnInit(): void {

    this.userId.set(this.authService.user()?.id)
  }

  
}
