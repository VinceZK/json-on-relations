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
import { RelationComponent } from './relation/relation.component';
import {RelationDetailComponent} from './relation/relation-detail/relation-detail.component';
import { RelationshipComponent } from './relationship/relationship.component';
import { RelationshipDetailComponent } from './relationship/relationship-detail/relationship-detail.component';
import { RoleComponent } from './role/role.component';
import { RoleDetailComponent } from './role/role-detail/role-detail.component';
import { DataElementComponent } from './data-element/data-element.component';
import { DataDomainComponent } from './data-domain/data-domain.component';
import { DataDomainDetailComponent } from './data-domain/data-domain-detail/data-domain-detail.component';
import { DataElementDetailComponent } from './data-element/data-element-detail/data-element-detail.component';

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
    AttributeMetaComponent,
    RelationComponent,
    RelationDetailComponent,
    RelationshipComponent,
    RelationshipDetailComponent,
    RoleComponent,
    RoleDetailComponent,
    DataElementComponent,
    DataElementDetailComponent,
    DataDomainComponent,
    DataDomainDetailComponent
  ]
})
export class ModelModule { }
