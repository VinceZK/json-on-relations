import { NgModule } from '@angular/core';
import { JorAngularComponent } from './jor-angular.component';
import {SearchHelpComponent} from './search-help/search-help.component';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    JorAngularComponent,
    SearchHelpComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    JorAngularComponent,
    SearchHelpComponent
  ]
})
export class JorAngularModule { }
