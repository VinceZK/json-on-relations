import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  { path: 'entity', loadChildren: () => import('./entity/entity.module').then(m => m.EntityModule) },
  { path: 'model', loadChildren:  () => import('./model/model.module').then( m => m.ModelModule) },
  { path: '',   redirectTo: '/entity/list', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })
  ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
