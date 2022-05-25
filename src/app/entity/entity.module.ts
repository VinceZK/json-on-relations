import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MessageModule} from 'ui-message-angular';
import {EntityComponent} from './entity.component';
import {EntityRelationComponent} from './entity-relation/entity-relation.component';
import {EntityRelationshipComponent} from './entity-relationship/entity-relationship.component';
import {ListComponent} from './entity-list/list.component';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HotTableModule} from '@handsontable/angular';
import { registerAllModules } from 'handsontable/registry';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {EntityRoutingModule} from './entity-routing.module';
import {JorAngularModule} from 'jor-angular';

// register Handsontable's modules
registerAllModules();

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    EntityRoutingModule,
    ReactiveFormsModule,
    MessageModule,
    HotTableModule.forRoot(),
    NgbModule,
    JorAngularModule
  ],
  declarations: [
    EntityComponent,
    EntityRelationComponent,
    EntityRelationshipComponent,
    ListComponent
  ],
  providers: [
  ]
})
export class EntityModule { }
