import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MessageModule} from 'ui-message-angular';
import {EntityComponent} from './entity.component';
import {AttributeComponent} from '../attribute/attribute.component';
import {EntityAttributeComponent} from './entity-attribute/entity-attribute.component';
import {EntityRelationComponent} from './entity-relation/entity-relation.component';
import {EntityRelationshipComponent} from './entity-relationship/entity-relationship.component';
import {AttributeFormComponent} from '../attribute/attribute-form/attribute-form.component';
import {AttributeTableComponent} from '../attribute/attribute-table/attribute-table.component';
import {ListComponent} from './entity-list/list.component';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HotTableModule} from '@handsontable/angular';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {EntityRoutingModule} from './entity-routing.module';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    EntityRoutingModule,
    ReactiveFormsModule,
    MessageModule,
    HotTableModule,
    NgbModule
  ],
  declarations: [
    EntityComponent,
    AttributeComponent,
    EntityAttributeComponent,
    EntityRelationComponent,
    EntityRelationshipComponent,
    AttributeFormComponent,
    AttributeTableComponent,
    ListComponent
  ],
  providers: [
  ]
})
export class EntityModule { }
