import { Component } from '@angular/core';
import {EntityService} from 'jor-angular';
import {environment} from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor( private entityService: EntityService) {
    this.entityService.setOriginalHost(environment.originalHost);
  }
}
