import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-change-username-dialog',
  templateUrl: './change-username-dialog.component.html',
  styleUrls: ['./change-username-dialog.component.css'],
})
export class ChangeUsernameDialogComponent {
  newUsername: string = '';

  constructor(public dialogRef: MatDialogRef<ChangeUsernameDialogComponent>) {}

  onSubmit() {
    this.dialogRef.close(this.newUsername);
  }

  onChange(event: any) {
    this.newUsername = event.target.value;
  }
}
