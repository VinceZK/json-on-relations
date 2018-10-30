import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ModelComponent} from './model.component';
import {EntityTypeComponent} from './entity-type/entity-type.component';
import {EntityTypeDetailComponent} from './entity-type/entity-type-detail/entity-type-detail.component';

const routes: Routes = [
  { path: '',
    component: ModelComponent,
    children: [
      { path: 'entity-type', component: EntityTypeComponent,
        children: [{ path: ':entityID', component: EntityTypeDetailComponent }] },
      { path: '', redirectTo: '/model/entity-type', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [ RouterModule ]
})
export class ModelRoutingModule { }
