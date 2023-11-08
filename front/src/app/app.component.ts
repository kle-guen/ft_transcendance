import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthGuard } from './auth/auth.guard';
import { WebsocketService } from './services/websocket.service';
//curl -X POST --data "grant_type=client_credentials&client_id=u-s4t2ud-52bf51db74521e692dd018c4d6452a177cc164ccf5bc5f85486b125d6d0680af&client_secret=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" https://api.intra.42.fr/oauth/token

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
})
export class AppComponent {
  isLoginPage: boolean = false;
  isPongPage: boolean = false;
  
  constructor(private router: Router,private websocketService:WebsocketService ) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isLoginPage = event.url === '/login';
      }
      if (event instanceof NavigationEnd) {
        this.isPongPage = event.url === '/pong' || event.url === '/classicpong' || event.url === '/custompong';
      }
    });
  }
  
  socket = this.websocketService.getSocket();
}
