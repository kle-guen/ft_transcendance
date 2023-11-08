import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private cookieService: CookieService, private router: Router) { }

  async isTokenValid(): Promise<boolean> {
    const token = this.cookieService.get('jwtToken');
    if (token === '') {
      this.router.navigate(['/login']);
      return false;
    }

    let status = false;
    await fetch('http://localhost:3000/api/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(async data => {
        status = data;
      })
      .catch(error => console.error(error));

    if (token && status !== false) {
      const decodedToken: any = jwtDecode(token);
      const expirationDate = new Date(decodedToken.exp * 1000);
      const currentDate = new Date();
      return currentDate < expirationDate;
    }

    return false;
  }
}
