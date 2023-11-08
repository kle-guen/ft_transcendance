import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { DialogData } from '../interfaces/interfaces';

@Component({
  selector: 'app-join-room',
  templateUrl: './join-room.component.html',
  styleUrls: ['./join-room.component.css']
})
export class JoinRoomComponent {
  constructor(
    public dialogRef: MatDialogRef<JoinRoomComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private _formBuilder: FormBuilder,
  ) { }

  toppings = this._formBuilder.group({
    invite: false,
  });

  onNoClick(): void {
    this.dialogRef.close();
  }

  myControl = new FormControl('');
  options: string[] = [];
  filteredOptions: Observable<string[]> | undefined;

  ngOnInit() {
    // Vérifiez que data.rooms est défini avant de le mapper
    if (this.data.rooms !== undefined) {
      // Utilisez la vérification explicite pour vous assurer que channelName est défini
      this.options = this.data.rooms
        .filter(room => room.channelName !== undefined) // Filtrer les rooms avec channelName défini
        .map(room => room.channelName as string); // Assurez-vous que channelName est de type string
    }

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }
}
