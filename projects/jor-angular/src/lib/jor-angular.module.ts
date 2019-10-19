import { NgModule } from '@angular/core';
import { JorAngularComponent } from './jor-angular.component';
import {SearchHelpComponent} from './search-help/search-help.component';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AttributeComponent} from './attribute/attribute.component';
import {AttributeFormComponent} from './attribute/attribute-form/attribute-form.component';
import {AttributeTableComponent} from './attribute/attribute-table/attribute-table.component';

@NgModule({
  declarations: [
    JorAngularComponent,
    SearchHelpComponent,
    AttributeComponent,
    AttributeFormComponent,
    AttributeTableComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    JorAngularComponent,
    SearchHelpComponent,
    AttributeComponent,
    AttributeFormComponent,
    AttributeTableComponent
  ]
})
export class JorAngularModule { }
