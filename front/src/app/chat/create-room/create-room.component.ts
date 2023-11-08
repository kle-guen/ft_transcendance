import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormBuilder } from '@angular/forms';

export interface DialogData {
  password: string;
  invitation: boolean;
  name: string;
  channelName:string;
}

@Component({
  selector: 'app-create-room',
  templateUrl: './create-room.component.html',
  styleUrls: ['./create-room.component.css']
})
export class CreateRoomComponent {
  constructor(
    public dialogRef: MatDialogRef<CreateRoomComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private _formBuilder: FormBuilder,
  ) { }

  toppings = this._formBuilder.group({
    invitation: false,
  });

  onNoClick(): void {
    this.dialogRef.close();
  }

  onOkClick():void{
    const inviteValue = this.toppings.get('invitation')?.value;
    if (inviteValue !== null && inviteValue !== undefined) {
      this.data.invitation = inviteValue as boolean; 
    } else {
      this.data.invitation = false; 
    }
    this.dialogRef.close(this.data);
  }

  ngOnInit() {
  }

}
