import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { EntityComponent } from './entity/entity.component';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MessageModule} from 'ui-message/dist/message';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { AttributeComponent } from './attribute/attribute.component';
import { EntityAttributeComponent } from './entity/entity-attribute/entity-attribute.component';
import { EntityRelationComponent } from './entity/entity-relation/entity-relation.component';
import { AttributeTableComponent } from './attribute/attribute-table/attribute-table.component';
import { AttributeFormComponent } from './attribute/attribute-form/attribute-form.component';
import { EntityRelationshipComponent } from './entity/entity-relationship/entity-relationship.component';

@NgModule({
  declarations: [
    AppComponent,
    EntityComponent,
    AttributeComponent,
    EntityAttributeComponent,
    EntityRelationComponent,
    EntityRelationshipComponent,
    AttributeFormComponent,
    AttributeTableComponent
  ],
  imports: [
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MessageModule,
    NgbModule.forRoot(),
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {

}
