import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-ladder',
  templateUrl: './ladder.component.html',
  styleUrls: ['./ladder.component.css'],
})
export class LadderComponent {
  constructor(private cookieService: CookieService, private router: Router, private httpClient: HttpClient) {}

  players: any[] = [];
  interval: any;

  async ngOnInit() {
    this.players = await this.ladderUpdate();
    this.interval = setInterval(async () => {
      this.players = await this.ladderUpdate();
    }, 1000);
  }

  async ladderUpdate(): Promise<any[]> {
    var tmp: any[] = [];

    const jwt = this.cookieService.get('jwtToken');
    if (!jwt || jwt.length < 1) {
      clearInterval(this.interval);
      return (this.players);
    }

    const responseFriend = await fetch('http://localhost:3000/api/user', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    });

    var a = 0;
    const data = await responseFriend.json();

    while (a < data.length) {
      var avatar = data[a].avatar;
      if (avatar.length < 1) avatar = '../../assets/avatar.png';
      tmp.push({
        me: data[a].userId == this.cookieService.get('userId') ? 1 : 0,
        elo: data[a].elo,
        name: data[a].userName,
        avatar: avatar,
        status: data[a].status,
      });
      a++;
    }
    tmp.sort(this.compareByElo);
    return tmp;
  }

  compareByElo(a: any, b: any) {
    return b.elo - a.elo;
  }

  async getUserByID(id: number) {
    var a = 0;

    const jwt = this.cookieService.get('jwtToken');
    if (!jwt || jwt.length < 1)
      return;

    const response = await fetch('http://localhost:3000/api/user', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`,
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

  async onClickAvatarLook(name: string) {
    const user = await this.getUserByID(
      parseInt(this.cookieService.get('userId'))
    );
    if (user.userName == name) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/profile'], {
        queryParams: { profile: name },
      });
    }
  }
}
