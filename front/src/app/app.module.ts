// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { MatMenuModule } from '@angular/material/menu';
import { AppRoutingModule } from './app-routing.module'; // Import the AppRoutingModule
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { AsyncPipe, CommonModule, JsonPipe } from '@angular/common';
import { PongComponent } from './pong/pong.component';
import { CookieService } from 'ngx-cookie-service';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { HandleauthComponent } from './handleauth/handleauth.component';
import { ChangeUsernameDialogComponent } from './change-username-dialog/change-username-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { GameModeSelectorComponent } from './game-mode-selector/game-mode-selector.component';
import { CustomPongComponent } from './custom-pong/custom-pong.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { jwtInterceptor } from './http.interceptor';
import { MatTabsModule } from '@angular/material/tabs';
import { ProfileComponent } from './profile/profile.component';
import { LadderComponent } from './ladder/ladder.component';
import { DialogOverviewTwoFAComponent } from './profile/dialog/DialogOverviewTwoFA.component';
import { ChatComponent } from './chat/chat.component';
import { CreateRoomComponent } from './chat/create-room/create-room.component';
import { JoinRoomComponent } from './chat/join-room/join-room.component';
import { SetPasswordComponent } from './chat/set-password/set-password.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MaterialModule } from './material-module';
import { DialogOverviewAuthComponent } from './handleauth/dialog/DialogOverviewTwoFA.component';
import { AchievementDialogComponent } from './achievement-dialog/achievement-dialog.component';
import { InviteUserComponent } from './chat/invite-user/invite-user.component';
import { BlockDialogComponent } from './block-dialog/block-dialog.component';

const routes: Routes = [];

@NgModule({
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    JsonPipe,
    CommonModule,
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    AppRoutingModule, // Include the AppRoutingModule in the imports
    FormsModule, // Include FormsModule in the imports
    MaterialModule,
  ],
  declarations: [
    ChatComponent,
    CreateRoomComponent,
    JoinRoomComponent,
    SetPasswordComponent,
    InviteUserComponent,
    ProfileComponent,
    LadderComponent,
    DialogOverviewTwoFAComponent,
    DialogOverviewAuthComponent,
    AppComponent,
    PongComponent,
    GameModeSelectorComponent,
    CustomPongComponent,
    NavBarComponent,
    LoginComponent,
    AboutUsComponent,
    HandleauthComponent,
    ChangeUsernameDialogComponent,
    AchievementDialogComponent,
    BlockDialogComponent,
  ],
  exports: [RouterModule],
  providers: [
    CookieService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: jwtInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
