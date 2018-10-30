import { NgModule } from '@angular/core';
import {ListComponent} from './entity-list/list.component';
import {EntityComponent} from './entity.component';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  { path: 'list', component: ListComponent },
  { path: ':instanceGUID', component: EntityComponent }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [ RouterModule ]
})
export class EntityRoutingModule { }
