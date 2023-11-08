import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private jwtToken: string;
  private socket: Socket;
  constructor(private cookieService: CookieService) {
    this.jwtToken = this.cookieService.get('jwtToken');
    this.socket = new Socket({
      url: 'http://localhost:3000',
      options: {
        extraHeaders: {
          Authorization: `Bearer ${this.jwtToken}`,
        },
      },
    });
  }

  public getSocket(): Socket {
    return this.socket;
  }
}
