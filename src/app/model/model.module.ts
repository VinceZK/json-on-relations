import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelComponent } from './model.component';
import { ModelRoutingModule } from './model-routing.module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { EntityTypeComponent } from './entity-type/entity-type.component';
import {HttpClientModule} from '@angular/common/http';
import { EntityTypeDetailComponent } from './entity-type/entity-type-detail/entity-type-detail.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AttributeMetaComponent } from './attribute-meta/attribute-meta.component';
import {MessageModule} from 'ui-message-angular';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ModelRoutingModule,
    MessageModule,
    NgbModule
  ],
  declarations: [
    ModelComponent,
    EntityTypeComponent,
    EntityTypeDetailComponent,
    AttributeMetaComponent
  ]
})
export class ModelModule { }
