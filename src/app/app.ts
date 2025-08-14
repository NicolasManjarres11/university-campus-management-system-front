import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Login } from '@features/users/components/login/login';
import { Register } from '@features/users/components/register/register';
import { MainLayout } from '@shared/components/layout/main.layout';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('university-campus-management-system-front');
}
