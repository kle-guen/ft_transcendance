import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

export interface DialogData {
    userName: string;
    response: any;
}

@Component({
    selector: 'dialog-overview-example-dialog',
    templateUrl: 'dialog-overview-example-dialog.html',
    styleUrls: ['./dialog-overview-example-dialog.css'],

})
export class DialogOverviewTwoFAComponent {
    constructor(
        public dialogRef: MatDialogRef<DialogOverviewTwoFAComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) { }


    onNoClick(): void {
        this.dialogRef.close();
    }
}
