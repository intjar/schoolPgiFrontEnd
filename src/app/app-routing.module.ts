import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuardGuard } from './guards/auth-guard.guard';
import { PortalComponent } from './portal/portal.component';

const routes: Routes = [
  {
    path: '', redirectTo: "login", pathMatch: "full"
  },
  {
    path: "login",
    component: LoginComponent
  },
  {
    path: "login",
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: "portal",
    canActivate: [AuthGuardGuard],
    loadChildren: () => import('./portal/portal.module').then(m => m.PortalModule)
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true,
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
