import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ListComponent} from './list/list.component';
import {EntityComponent} from './entity/entity.component';

const routes: Routes = [
  { path: 'list', component: ListComponent },
  { path: 'entity/:instanceGUID', component: EntityComponent },
  { path: '',   redirectTo: '/list', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
