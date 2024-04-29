import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardCardComponent } from './dashboard-card/dashboard-card.component';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { SharedModule } from '../shared/shared.module';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    DashboardComponent,
    DashboardCardComponent,
    PieChartComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    HighchartsChartModule,
    SharedModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    NgSelectModule,
    FormsModule
  ]
})
export class DashboardModule { }