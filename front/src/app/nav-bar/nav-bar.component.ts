import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import jwtDecode from 'jwt-decode';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
})
export class NavBarComponent {
  constructor(private cookieService: CookieService, private router: Router) {}

  userName: string | null = '';

  async ngOnInit() {
    var jwtToken = this.cookieService.get('jwtToken');

    if (jwtToken) {
      const decodedToken: any = jwtDecode(jwtToken);
      this.userName = this.cookieService.get('userName');
    }
  }

  async onClickWithRefresh() {
    await this.router.navigate(['']);
    this.router.navigate(['/profile']);
  }
}
