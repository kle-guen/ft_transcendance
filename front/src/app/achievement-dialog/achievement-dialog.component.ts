import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-achievement-dialog',
  templateUrl: './achievement-dialog.component.html',
  styleUrls: ['./achievement-dialog.component.css'],
})
export class AchievementDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AchievementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  achievement: any[] = [];
  i: number = 0;

  ngOnInit() {
    if (this.data.game) {
      this.achievement.push({
        name: 'Welcome',
        description: 'Play a game.',
      });
    }
    if (this.data.win) {
      this.achievement.push({
        name: 'GG WP',
        description: 'Win a game.',
      });
    }

    this.i = this.achievement.length;
  }

  onClose() {
    this.dialogRef.close();
  }
}
