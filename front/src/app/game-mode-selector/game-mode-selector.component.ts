import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-mode-selector',
  templateUrl: './game-mode-selector.component.html',
  styleUrls: ['./game-mode-selector.component.css']
})

export class GameModeSelectorComponent {
  constructor(private router: Router) {}

  startClassicMode() {
    this.router.navigate(['/classicpong']);
  }

  startCustomMode() {
    this.router.navigate(['/custompong']);
  }
}
