import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-block-dialog',
  templateUrl: './block-dialog.component.html',
  styleUrls: ['./block-dialog.component.css'],
})
export class BlockDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<BlockDialogComponent>,
    private cookieService: CookieService
  ) {}

  list: any[] = [];

  async ngOnInit() {
    this.list = await this.getList();
  }

  async getList() {
    var tmp: any[] = [];
    const response = await fetch('http://localhost:3000/api/blacklist', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.cookieService.get('jwtToken')}`,
        'Content-Type': 'application/json',
      },
    });

    var a = 0;
    const data = await response.json();

    while (a < data.length) {
      if (data[a].blackListedUserId == this.cookieService.get('userId')) {
        const user = await this.getUserByID(data[a].blackListedUserTargetId);
        if (user == null) continue;
        tmp.push({
          id: data[a].id,
          name: user.userName,
        });
      }
      a++;
    }
    return tmp;
  }

  async getUserByID(id: number) {
    var a = 0;

    const response = await fetch('http://localhost:3000/api/user', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.cookieService.get('jwtToken')}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    while (a < data.length) {
      if (data[a].userId == id) return data[a];
      a++;
    }
    return null;
  }

  onClose() {
    this.dialogRef.close();
  }

  async onClick(id: number) {
    await fetch('http://localhost:3000/api/blacklist/' + id, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.cookieService.get('jwtToken')}`,
        'Content-Type': 'application/json',
      },
    });
    this.list = await this.getList();
  }
}
