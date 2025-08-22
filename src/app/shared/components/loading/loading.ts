import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  imports: [NgClass],
  templateUrl: './loading.html',
  styleUrl: './loading.css'
})
export class Loading {

  message = input<string>('Cargando...');
  spinnerColor = input<string>('border-purple-500');
  textColor = input<string>('text-purple-700');
  spinnerSize = input<string>('w-16 h-16');
  bgColor = input<string>('bg-white');
  bgOpacity = input<string>('bg-opacity-100');
  fullScreen = input<boolean>(true);

}
