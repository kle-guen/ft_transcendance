import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import jwtDecode from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';
import { ChangeUsernameDialogComponent } from '../change-username-dialog/change-username-dialog.component';
import { Uploader } from 'uploader';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DialogOverviewTwoFAComponent } from './dialog/DialogOverviewTwoFA.component';
import { WebsocketService } from '../services/websocket.service';
import { Router } from '@angular/router';
import { AchievementDialogComponent } from '../achievement-dialog/achievement-dialog.component';
import { BlockDialogComponent } from '../block-dialog/block-dialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
  constructor(
    private cookieService: CookieService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private websocketService: WebsocketService,
    private router: Router
  ) {}

  isChecked = true;
  username: string | null = '';
  avatar: string = '../../assets/avatar.png';
  lookingProfile: boolean = false;
  games: any[] = [];
  friends: any[] = [];
  win: number = 0;
  lose: number = 0;
  winrate: number = 0;
  elo: number = 0;
  interval: any;

  socket = this.websocketService.getSocket();

  async ngOnInit() {
    const jwt = this.cookieService.get('jwtToken');
    if (!jwt || jwt.length < 1)
      return;

    this.httpClient
      .get('http://localhost:3000/api/user/getTwofa', { withCredentials: true })
      .subscribe((response: any) => {
        this.isChecked = response;
      });

    const profile = this.route.snapshot.queryParamMap.get('profile');
    if (profile != null) {
      const userProfile = await this.getUserByUsername(profile);
      if (userProfile != null)
        this.lookingProfile = true;
    }

    var id = await this.getId();
    const user = await this.getUserByID(id);
    if (!user)
      return;

    this.username = user.userName;
    this.elo = user.elo;
    if (user.avatar.length > 0) this.avatar = user.avatar;

    var avatarElement = document.getElementById('avatarElement');
    if (avatarElement instanceof HTMLImageElement)
      avatarElement.src = this.avatar;

    const responseHistory = await fetch('http://localhost:3000/api/game', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    });

    var a = 0;
    const dataHistory = await responseHistory.json();

    while (a < dataHistory.length) {
      const user1 = await this.getUserByID(dataHistory[a].idPlayerOneUserId);
      if (!user1)
        return;
      const user2 = await this.getUserByID(dataHistory[a].idPlayerTwoUserId);
      if (!user2)
        return;
      var avatar1 = user1.avatar;
      if (avatar1.length < 1) avatar1 = '../../assets/avatar.png';
      var avatar2 = user2.avatar;
      if (avatar2.length < 1) avatar2 = '../../assets/avatar.png';

      if (dataHistory[a].idPlayerOneUserId == id) {
        this.games.push({
          name: user1.userName,
          score: dataHistory[a].scorePlayerOne,
          avatar: avatar1,
          opponent: user2.userName,
          opponentScore: dataHistory[a].scorePlayerTwo,
          opponentAvatar: avatar2,
          gameType: dataHistory[a].gameType,
        });
        if (dataHistory[a].scorePlayerOne > dataHistory[a].scorePlayerTwo)
          this.win++;
        else this.lose++;
      }
      if (dataHistory[a].idPlayerTwoUserId == id) {
        this.games.push({
          name: user2.userName,
          score: dataHistory[a].scorePlayerTwo,
          avatar: avatar2,
          opponent: user1.userName,
          opponentScore: dataHistory[a].scorePlayerOne,
          opponentAvatar: avatar1,
          gameType: dataHistory[a].gameType,
        });
        if (dataHistory[a].scorePlayerOne < dataHistory[a].scorePlayerTwo)
          this.win++;
        else this.lose++;
      }
      a++;
    }
    if (this.lose + this.win != 0)
      this.winrate = parseFloat(
        ((this.win / (this.lose + this.win)) * 100).toFixed(2)
      );

    this.friends = await this.friendUpdate(id);
    this.interval = setInterval(async () => {
      this.friends = await this.friendUpdate(id);
    }, 1000);
  }

  async friendUpdate(id: number): Promise<any[]> {
    var tmp: any[] = [];
    const jwt = this.cookieService.get('jwtToken');
    if (!jwt || jwt.length < 1) {
      clearInterval(this.interval);
      return (this.friends);
    }

    const responseFriend = await fetch('http://localhost:3000/api/friend', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.cookieService.get('jwtToken')}`,
        'Content-Type': 'application/json',
      },
    });

    var a = 0;
    const dataFriend = await responseFriend.json();

    while (a < dataFriend.length) {
      if (dataFriend[a].friendUserId == id) {
        const user3 = await this.getUserByID(dataFriend[a].friendUserTargetId);
        if (!user3)
          return tmp;
        var avatar3 = user3.avatar;
        if (avatar3.length < 1) avatar3 = '../../assets/avatar.png';
        tmp.push({
          id: dataFriend[a].id,
          userId: user3.userId,
          name: user3.userName,
          avatar: avatar3,
          type: dataFriend[a].isAccept ? 0 : 1,
          status: user3.status,
        });
      }
      if (dataFriend[a].friendUserTargetId == id) {
        const user3 = await this.getUserByID(dataFriend[a].friendUserId);
        if (!user3)
          return tmp;
        var avatar3 = user3.avatar;
        if (avatar3.length < 1) avatar3 = '../../assets/avatar.png';
        tmp.push({
          id: dataFriend[a].id,
          userId: user3.userId,
          name: user3.userName,
          avatar: avatar3,
          type: dataFriend[a].isAccept ? 0 : 2,
          status: user3.status,
        });
      }
      a++;
    }
    return tmp;
  }

  async getId() {
    const jwt = this.cookieService.get('jwtToken');
    if (!jwt || jwt.length < 1)
      return null;

    const profile = this.route.snapshot.queryParamMap.get('profile');
    if (profile != null) {
      const user = await this.getUserByUsername(profile);
      if (user != null) {
        return user.userId;
      }
    }

    const jwtToken = this.cookieService.get('jwtToken');
    const decodedToken: any = jwtDecode(jwtToken);
    return decodedToken.userId;
  }

  async getUserByID(id: number) {
    var a = 0;

    const jwt = this.cookieService.get('jwtToken');
    if (!jwt || jwt.length < 1)
      return null;

    const response = await fetch('http://localhost:3000/api/user', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!data)
      return null;

    while (a < data.length) {
      if (data[a].userId == id) return data[a];
      a++;
    }
    return null;
  }

  async getUserByUsername(name: string) {
    var a = 0;

    const jwt = this.cookieService.get('jwtToken');
    if (!jwt || jwt.length < 1)
      return null;

    const response = await fetch('http://localhost:3000/api/user', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    if (!data)
      return null;

    while (a < data.length) {
      if (data[a].userName.toLowerCase() == name.toLowerCase()) return data[a];
      a++;
    }
    return null;
  }

  async onClickName() {
    if (this.lookingProfile) return;
    const jwt = this.cookieService.get('jwtToken');
    if (!jwt || jwt.length < 1)
      return;

    const dialogRef = this.dialog.open(ChangeUsernameDialogComponent, {
      width: '300px',
      height: '200px',
    });

    const result: string = await dialogRef.afterClosed().toPromise();
    var regex = /^[a-zA-Z0-9_]+$/;

    if (!result) return;

    if (result.length < 3) {
      alert('Username too short !');
      return;
    }
    if (result.length > 16) {
      alert('Username too long !');
      return;
    }
    if (!regex.test(result)) {
      alert('Invalid character !');
      return;
    }

    const user = await this.getUserByUsername(result);
    if (user != null && this.getId() != user.userId) {
      alert('Username already claim !');
      return;
    }

    this.cookieService.set('userName', result);
    this.username = result;

    let id = await this.getId();
    if (!id)
      return;

    fetch(`http://localhost:3000/api/user/` + id, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userName: result }),
    });
    location.reload();
  }

  async twoFAButton() {
    this.httpClient
      .post('http://localhost:3000/api/user/setTwofa', { code: this.isChecked })
      .subscribe((response: any) => {
        if (this.isChecked === true) {
          const dialogRef = this.dialog.open(DialogOverviewTwoFAComponent, {
            data: {
              userName: this.username,
              response: response,
            },
          });

          dialogRef.afterClosed().subscribe(() => {
            console.log('The dialog was closed');
          });
        }
      });
  }

  async onClickAvatar() {
    if (this.lookingProfile) return;
    const jwt = this.cookieService.get('jwtToken');
    if (!jwt || jwt.length < 1)
      return;

    const uploader = Uploader({ apiKey: 'free' });
    let id = await this.getId();
    if (!id)
      return;

    await uploader
      .open({
        editor: {
          images: {
            crop: true,
            cropShape: 'circ',
            cropRatio: 1 / 1,
          },
        },
      })
      .then((files) => {
        if (files.length === 0) {
          console.log('No files selected.');
        } else {
          this.cookieService.set('avatar', files.map((f) => f.fileUrl).toString());
          fetch(`http://localhost:3000/api/user/` + id, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${jwt}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              avatar: files.map((f) => f.fileUrl).toString(),
            }),
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
      location.reload();
  }

  async checkFriend(id1: number, id2: number): Promise<boolean> {
    const jwt = this.cookieService.get('jwtToken');
    if (!jwt || jwt.length < 1)
      return false;
    const responseFriend = await fetch('http://localhost:3000/api/friend', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    });

    var a = 0;
    const dataFriend = await responseFriend.json();
    if (!dataFriend)
      return false;

    while (a < dataFriend.length) {
      if (
        dataFriend[a].friendUserId == id1 &&
        dataFriend[a].friendUserTargetId == id2
      )
        return true;
      if (
        dataFriend[a].friendUserId == id2 &&
        dataFriend[a].friendUserTargetId == id1
      )
        return true;
      a++;
    }
    return false;
  }

  async checkBlock(id1: number, id2: number): Promise<boolean> {
    const jwt = this.cookieService.get('jwtToken');
    if (!jwt || jwt.length < 1)
      return (false);

    const response = await fetch('http://localhost:3000/api/blacklist', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    });

    var a = 0;
    const data = await response.json();
    if (!data)
      return false;

    while (a < data.length) {
      if (
        data[a].blackListedUserId == id1 &&
        data[a].blackListedUserTargetId == id2
      )
        return true;
      if (
        data[a].blackListedUserId == id2 &&
        data[a].blackListedUserTargetId == id1
      )
        return true;
      a++;
    }
    return false;
  }

  async onClickFriendAdd() {
    var input = (document.getElementById('friend') as HTMLInputElement).value;
    const jwt = this.cookieService.get('jwtToken');
    if (!jwt || jwt.length < 1)
      return;

    if (input.length < 1) return;
    const user = await this.getUserByUsername(input);
    const id = await this.getId();
    if (!id)
      return;

    if (user == null) {
      alert(`The user doesn't exist !`);
      return;
    }
    if (id == user.userId) {
      alert(`Nice try !`);
      return;
    }
    if (await this.checkFriend(id, user.userId)) {
      alert(`You are already friends !`);
      return;
    }
    if (await this.checkBlock(id, user.userId)) {
      alert(`You have blocked this user, or he has block you !`);
      return;
    }

    fetch(`http://localhost:3000/api/friend/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        friendUserId: id,
        friendUserTargetId: user.userId,
      }),
    });
  }

  async onClickAvatarLook(name: string) {
    const jwt = this.cookieService.get('jwtToken');
    if (!jwt || jwt.length < 1)
      return;

    const user = await this.getUserByID(
      parseInt(this.cookieService.get('userId'))
    );

    if (!user)
      return;

    await this.router.navigate(['']);

    if (user.userName == name)
      this.router.navigate(['/profile']);
    else
      this.router.navigate(['/profile'], {
        queryParams: { profile: name },
      });
  }

  async onClickDeleteFriend(id: number) {
    const jwt = this.cookieService.get('jwtToken');
    if (!jwt || jwt.length < 1)
      return;

    await fetch('http://localhost:3000/api/friend/' + id, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
    });
    const idG = await this.getId();
    if (!idG)
      this.friends = await this.friendUpdate(idG);
  }

  async onClickAcceptFriend(id: number) {
    const jwt = this.cookieService.get('jwtToken');
    if (!jwt || jwt.length < 1)
      return;

    await fetch('http://localhost:3000/api/friend/' + id, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isAccept: true }),
    });
    const idG = await this.getId();
    if (!idG)
      this.friends = await this.friendUpdate(idG);
  }

  async onClickMessage(userId: number | undefined) {
    this.socket.emit('privateChannel', { userTargetId: userId });
    this.router.navigate(['/chat']);
  }

  onClickAchievement() {
    const jwt = this.cookieService.get('jwtToken');
    if (!jwt || jwt.length < 1)
      return;
  
    this.dialog.open(AchievementDialogComponent, {
      data: {
        win: this.win,
        game: this.win + this.lose,
      },
      width: '500px',
    });
  }

  async onClickBlock(id: number, userId: number) {
    const jwt = this.cookieService.get('jwtToken');
    if (!jwt || jwt.length < 1)
      return;
    this.onClickDeleteFriend(id);

    fetch(`http://localhost:3000/api/blacklist/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        blackListedUserId: this.cookieService.get('userId'),
        blackListedUserTargetId: userId,
      }),
    });
  }

  onClickBlockDialog() {
    const jwt = this.cookieService.get('jwtToken');
    if (!jwt || jwt.length < 1)
      return;

    this.dialog.open(BlockDialogComponent, {
      width: '500px',
    });
  }
}
