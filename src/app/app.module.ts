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
import { ListComponent } from './list/list.component';
import {HotTableModule} from '@handsontable/angular';
import { AppRoutingModule } from './app-routing.module';
import {CustomReuseStrategy} from './custom.reuse.strategy';
import {RouteReuseStrategy} from '@angular/router';

@NgModule({
  declarations: [
    AppComponent,
    EntityComponent,
    AttributeComponent,
    EntityAttributeComponent,
    EntityRelationComponent,
    EntityRelationshipComponent,
    AttributeFormComponent,
    AttributeTableComponent,
    ListComponent
  ],
  imports: [
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MessageModule,
    HotTableModule.forRoot(),
    NgbModule.forRoot(),
    BrowserModule
  ],
  providers: [
    {provide: RouteReuseStrategy, useClass: CustomReuseStrategy}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
