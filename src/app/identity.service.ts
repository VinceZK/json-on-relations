import { Injectable } from '@angular/core';
import {formatDate} from '@angular/common';
import {Session} from 'ui-logon-angular';

@Injectable({
  providedIn: 'root'
})
export class IdentityService {
  private session: Session;

  constructor() {
  }

  setSession( data: any ) {
    this.session = <Session>data;
  }

  get Session(): Session {
    if (this.session) { return this. session; }
    const defaultSession = new Session();
    defaultSession.USER_ID = 'DH001';
    defaultSession.LANGUAGE = 'EN';
    return defaultSession;
  }

  get CurrentTime(): string {
    return formatDate( new Date(), 'yyyy-MM-dd hh:mm:ss', 'en-US' );
  }
}
