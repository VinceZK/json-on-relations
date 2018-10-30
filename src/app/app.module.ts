import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {MessageModule} from 'ui-message-angular';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HotTableModule} from '@handsontable/angular';
import { AppRoutingModule } from './app-routing.module';
import {RouteReuseStrategy} from '@angular/router';
import {CustomReuseStrategy} from './custom.reuse.strategy';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    HttpClientModule,
    AppRoutingModule,
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
