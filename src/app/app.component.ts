import { Component } from '@angular/core';
import {EntityService} from 'jor-angular';
import {environment} from '../environments/environment';
import {MessageService} from 'ui-message-angular';
import {msgStore} from './msgStore';
import {LogonService} from 'ui-logon-angular';
import {IdentityService} from './identity.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor( private entityService: EntityService,
               private identityService: IdentityService,
               private messageService: MessageService,
               private logonService: LogonService) {
    this.entityService.setOriginalHost(environment.originalHost);
    this.logonService.setHost(environment.originalHost);
    this.logonService.session().subscribe( data => {
      this.identityService.setSession( data );
      this.messageService.setMessageStore(msgStore, this.identityService.Session.LANGUAGE);
    });
  }
}
