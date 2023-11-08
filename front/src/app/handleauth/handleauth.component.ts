import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import jwtDecode from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';
import { DialogOverviewAuthComponent } from './dialog/DialogOverviewTwoFA.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-handleauth',
  templateUrl: './handleauth.component.html',
  styleUrls: ['./handleauth.component.css'],
})
export class HandleauthComponent {
  constructor(
    private cookieService: CookieService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog
  ) {}
  jwt: string = '';
  async ngOnInit() {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (code === null) {
      return;
    }

    await fetch('http://localhost:3000/api/access-token?code=' + code, {
      method: 'POST',
      mode: 'cors',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.jwt === undefined) {
          const dialogRef = this.dialog.open(DialogOverviewAuthComponent, {
            data: {
              code: code,
            },
          });
          dialogRef.afterClosed().subscribe(async (result) => {
            await fetch('http://localhost:3000/api/access-token?code=' + code, {
              method: 'POST',
              body: JSON.stringify({ message: result }), // Convertissez l'objet en JSON
              headers: {
                'Content-Type': 'application/json', // Définissez l'en-tête Content-Type pour JSON
              },
            })
              .then((response) => response.json())
              .then((data) => {
                if (data !== true)
                  this.setCookie(data);
                else 
                  this.router.navigate(['/login']);
              });
          });
        } else this.setCookie(data);
      });
  }

  setCookie(data: any) {
    const decodedToken: any = jwtDecode(data.jwt);
    this.cookieService.set('jwtToken', data.jwt);
    this.cookieService.set('userName', data.userName);
    this.cookieService.set('ftUser', data.ftUser);
    this.cookieService.set('userId', decodedToken.userId);
    location.href = 'http://localhost:4200';
  }
}
