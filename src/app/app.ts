import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Login } from '@features/users/components/login/login';
import { Register } from '@features/users/components/register/register';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Login, Register],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('university-campus-management-system-front');
}
