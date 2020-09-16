import { NgModule } from '@angular/core';
import { JorAngularComponent } from './jor-angular.component';
import {SearchHelpComponent} from './search-help/search-help.component';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AttributeComponent} from './attribute/attribute.component';
import {AttributeFormComponent} from './attribute/attribute-form/attribute-form.component';
import {AttributeTableComponent} from './attribute/attribute-table/attribute-table.component';
import { AttributeForm2Component } from './attribute/attribute-form2/attribute-form2.component';

@NgModule({
  declarations: [
    JorAngularComponent,
    SearchHelpComponent,
    AttributeComponent,
    AttributeFormComponent,
    AttributeTableComponent,
    AttributeForm2Component
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    SearchHelpComponent,
    AttributeComponent,
    AttributeFormComponent,
    AttributeForm2Component,
    AttributeTableComponent
  ]
})
export class JorAngularModule { }
