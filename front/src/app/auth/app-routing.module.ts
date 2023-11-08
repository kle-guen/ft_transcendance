// app-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard'; // Import the AuthGuard

@NgModule({
  exports: [RouterModule]
})
export class AppRoutingModule {}
