import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PongComponent } from './pong/pong.component';
import { ChatComponent } from './chat/chat.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { HandleauthComponent } from './handleauth/handleauth.component';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { LadderComponent } from './ladder/ladder.component';
import { GameModeSelectorComponent } from './game-mode-selector/game-mode-selector.component';
import { CustomPongComponent } from './custom-pong/custom-pong.component';

const routes: Routes = [
  {
    path: 'pong',
    component: GameModeSelectorComponent,
    canActivate: [AuthGuard],
  },
  { path: 'classicpong', component: PongComponent, canActivate: [AuthGuard] },
  {
    path: 'custompong',
    component: CustomPongComponent,
    canActivate: [AuthGuard],
  },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'about', component: AboutUsComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'ladder', component: LadderComponent, canActivate: [AuthGuard] },
  { path: '', component: AboutUsComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'handleauth', component: HandleauthComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
