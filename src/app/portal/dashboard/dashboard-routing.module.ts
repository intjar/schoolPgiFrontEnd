import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DashboardCardComponent } from './dashboard-card/dashboard-card.component';


const routes: Routes = [
{
    path:"dashboard",
    component:DashboardComponent
},
{
  path:"dashboard-card",
  component:DashboardCardComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
