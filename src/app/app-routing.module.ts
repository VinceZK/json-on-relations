import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  { path: 'entity', loadChildren: './entity/entity.module#EntityModule'},
  { path: 'model', loadChildren: './model/model.module#ModelModule'},
  { path: '',   redirectTo: '/entity/list', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
