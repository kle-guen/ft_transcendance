import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import jwtDecode from "jwt-decode";
import { CookieService } from "ngx-cookie-service";
import { Observable } from "rxjs";

@Injectable()
export class jwtInterceptor implements HttpInterceptor {
    constructor(private cookieService: CookieService,private router: Router){}    
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Récupération du token d'authentification (à remplacer par votre code)
        const token = this.cookieService.get('jwtToken');
        if(token === null)
            this.router.navigate(['/login']);
        const decodedToken: any = jwtDecode(token);
        const authReq = request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            },
        });
        // Envoi de la requête avec les nouvelles entêtes
        return next.handle(authReq);
    }
}