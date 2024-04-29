import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterDirective } from 'src/app/directive/character.directive';
import { Sort } from 'src/app/pipes/sort.pipe';
import { SortDirective } from 'src/app/directive/sort.directive';
import { AllownumbersonlyDirective } from 'src/app/directive/allownumbersonly.directive';
import { AlphaNumericSearchDirective } from 'src/app/directive/alphanumeric-search-directive';
import { UrlPatternDirective } from 'src/app/directive/url.directive';
import { DomainDirective } from 'src/app/directive/domain.directive';
import { NoRecordFoundComponent } from './no-record-found/no-record-found.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { LoaderComponent } from './loader/loader.component';
import { surveyDirective } from 'src/app/directive/survey.directive';
import { BlockcopypasteDirective } from 'src/app/directive/blockcopypaste.directive';
import { NgxPrintElementModule } from 'ngx-print-element';
import { EmailDirective } from '../../directive/email.directive';
import { AdvanceFilterComponent } from './advance-filter/advance-filter.component';
import { ShowRoleBaseActionsDirective } from 'src/app/directive/show-role-base-actions.directive';
import { UsernameDirective } from 'src/app/directive/username.directive';
import { DomainNameDirective } from 'src/app/directive/domain-name.directive';
import { FinancialYearDropdownComponent } from './financial-year-dropdown/financial-year-dropdown.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    CharacterDirective,
    Sort,
    SortDirective,
    AllownumbersonlyDirective,
    AlphaNumericSearchDirective,
    UrlPatternDirective,
    DomainDirective,
    NoRecordFoundComponent,
    BreadcrumbComponent,
    LoaderComponent,
    surveyDirective,
    BlockcopypasteDirective,
    EmailDirective,
    AdvanceFilterComponent,
    ShowRoleBaseActionsDirective,
    UsernameDirective,
    DomainNameDirective,
    FinancialYearDropdownComponent,



  ],
  imports: [CommonModule, NgxPrintElementModule, NgSelectModule, FormsModule],
  exports: [CharacterDirective, Sort, SortDirective, AllownumbersonlyDirective, AlphaNumericSearchDirective, UrlPatternDirective, DomainDirective, BreadcrumbComponent, LoaderComponent, NoRecordFoundComponent, surveyDirective, BlockcopypasteDirective, EmailDirective, NgxPrintElementModule, ShowRoleBaseActionsDirective, UsernameDirective, DomainNameDirective, FinancialYearDropdownComponent]

})
export class SharedModule { }
