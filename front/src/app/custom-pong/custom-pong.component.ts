import { Component, HostListener } from '@angular/core';
import { WebsocketService } from '../services/websocket.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-custom-pong',
  templateUrl: './custom-pong.component.html',
  styleUrls: ['./custom-pong.component.css']
})

export class CustomPongComponent {
  gameStatus = 0;
  connexionsNb = 0;
  roomsNb = 0;
  idGame = 0;
  x = 0;
  scoreP1 = 0;
  scoreP2 = 0;
  ballLeft = 49;
  ballTop = 48.75;
  side = 0;
  paddleLeftTop = 42;
  paddleRightTop = 42;

  nameP1 = this.cookieService.get('userName');
  avatarP1 = '../../assets/avatar.png';
  nameP2 = '???';
  avatarP2 = '../../assets/avatar.png';
  roomName = 'Looking for a game...';
  isLoadingP2 = true;

  constructor(private websocketService: WebsocketService, private router: Router, private cookieService: CookieService) { }

  socket = this.websocketService.getSocket();

  ngOnInit() {
    const avatar = this.cookieService.get('avatar');
    if (avatar || avatar.length > 1)
      this.avatarP1 = avatar;

    this.socket.emit('joinGame', "custom");
    this.socket.on('MatchFound', (data: any) => {
      this.gameStatus = 1;
      this.isLoadingP2 = false;
      this.roomName = data.room;
      this.nameP1 = data.nameP1;
      this.avatarP1 = data.avatarP1;
      this.nameP2 = data.nameP2;
      this.avatarP2 = data.avatarP2;
      if (this.avatarP2.length < 1) this.avatarP2 = '../../assets/avatar.png';
      if (this.avatarP1.length < 1) this.avatarP1 = '../../assets/avatar.png';
      if (this.nameP1.length < 1) this.nameP1 = '???';
      if (this.nameP2.length < 1) this.nameP2 = '???';
    });
    
    this.socket.on('Stats', (data: any) => {
      this.connexionsNb = data.connexionsNb;
      this.roomsNb = data.roomsNb;
    });
    
    this.socket.on('Side', (data: any) => {
      this.side = data.side;
    });
    
    this.socket.on('gameUpdate', (data: any) => {
      this.scoreP1 = data.scoreP1;
      this.scoreP2 = data.scoreP2;
      this.ballLeft = data.ballLeft / 8;
      this.ballTop = data.ballTop / 5;
      this.gameStatus = data.gameStatus;
      if (this.side == 1)
        this.paddleLeftTop = data.paddleLeftTop / 5; 
      else
        this.paddleRightTop = data.paddleRightTop / 5;
    });
    
    this.socket.on('gameResult', (data: any) => {
      this.scoreP1 = data.scoreP1;
      this.scoreP2 = data.scoreP2;
      this.gameStatus = 4;
      this.socket.emit('endGame');
    });
  }
  ngOnDestroy() {
    if (this.gameStatus == 1)
      this.socket.emit('playerLeftGame');
    else
      this.socket.emit('endGame', 'custom');
  }

  redirectHome() {
    this.router.navigate(['']);
  }

  redirectGameSelector() {
    this.router.navigate(['/pong']);
  }

  @HostListener('window:beforeunload')
  OnPlayerLeft()
  {
    if (this.gameStatus == 1)
      this.socket.emit('playerLeftGame');
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.gameStatus == 0 || this.gameStatus == 4)
      return;
    if (event.key === 'ArrowDown' && this.paddleLeftTop < 84 && this.side == 0) {
      this.paddleLeftTop += 3;
    }
    if (event.key === 'ArrowUp' && this.paddleLeftTop > 0 && this.side == 0) {
      this.paddleLeftTop -= 3;
    }
    if (event.key === 'ArrowDown' && this.paddleRightTop < 84 && this.side == 1) {
      this.paddleRightTop += 3;
    }
    if (event.key === 'ArrowUp' && this.paddleRightTop > 0 && this.side == 1) {
      this.paddleRightTop -= 3;
    }
    this.socket.emit('paddleCoordinates', {
      roomName: this.roomName,
      side: this.side,
      paddleLeftTop: this.paddleLeftTop * 5,  // 500 / 100
      paddleRightTop: this.paddleRightTop * 5,
    });
  }
}
