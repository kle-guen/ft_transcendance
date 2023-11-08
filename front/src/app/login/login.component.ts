import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  clickConnect() {
    const params = new URLSearchParams({
      client_id:
        'u-s4t2ud-52bf51db74521e692dd018c4d6452a177cc164ccf5bc5f85486b125d6d0680af',
      redirect_uri: 'http://localhost:4200/handleauth',
      scope: 'public',
      state: 'connect',
      response_type: 'code',
    });

    const authURL = `https://api.intra.42.fr/oauth/authorize?${params.toString()}`;

    window.location.href = authURL;
  }
}
