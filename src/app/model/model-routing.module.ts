import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ModelComponent} from './model.component';
import {EntityTypeComponent} from './entity-type/entity-type.component';
import {EntityTypeDetailComponent} from './entity-type/entity-type-detail/entity-type-detail.component';
import {RelationComponent} from './relation/relation.component';
import {RelationDetailComponent} from './relation/relation-detail/relation-detail.component';
import {WorkProtectionGuard} from './work-protection.guard';
import {RelationshipComponent} from './relationship/relationship.component';
import {RelationshipDetailComponent} from './relationship/relationship-detail/relationship-detail.component';
import {RoleComponent} from './role/role.component';
import {RoleDetailComponent} from './role/role-detail/role-detail.component';

const routes: Routes = [
  { path: '',
    component: ModelComponent,
    children: [
      { path: 'entity-type', component: EntityTypeComponent,
        children: [{ path: ':entityID', canDeactivate: [WorkProtectionGuard], component: EntityTypeDetailComponent }] },
      { path: 'role', component: RoleComponent,
        children: [{ path: ':roleID', canDeactivate: [WorkProtectionGuard], component: RoleDetailComponent }] },
      { path: 'relation', component: RelationComponent,
        children: [{ path: ':relationID', canDeactivate: [WorkProtectionGuard], component: RelationDetailComponent }] },
      { path: 'relationship', component: RelationshipComponent,
        children: [{ path: ':relationshipID', canDeactivate: [WorkProtectionGuard], component: RelationshipDetailComponent }] },
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
