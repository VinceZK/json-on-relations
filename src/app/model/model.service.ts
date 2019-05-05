import { Injectable } from '@angular/core';
import {EntityType, Relation, RelationshipH, RoleH} from 'jor-angular';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  private dialogAnswer = new Subject<string>();
  dialogAnswer$ = this.dialogAnswer.asObservable();

  private theSelectedEntityType: EntityType;
  private selectedEntityTypeSource = new Subject<EntityType>();
  theSelectedEntityType$ = this.selectedEntityTypeSource.asObservable();

  private theSelectedRelation: Relation;
  private selectedRelationSource = new Subject<Relation>();
  theSelectedRelation$ = this.selectedRelationSource.asObservable();

  private theSelectedRelationship: RelationshipH;
  private selectedRelationshipSource = new Subject<RelationshipH>();
  theSelectedRelationship$ = this.selectedRelationshipSource.asObservable();

  private theSelectedRole: RoleH;
  private selectedRoleSource = new Subject<RoleH>();
  theSelectedRole$ = this.selectedRoleSource.asObservable();

  updateEntityID(entityID: string) {
    this.theSelectedEntityType.ENTITY_ID = entityID;
    this.selectedEntityTypeSource.next(this.theSelectedEntityType);
  }

  updateEntityDesc(entityDesc: string) {
    this.theSelectedEntityType.ENTITY_DESC = entityDesc;
    this.selectedEntityTypeSource.next(this.theSelectedEntityType);
  }

  setSelectedEntityType(entityType: EntityType): void {
    this.theSelectedEntityType = entityType;
  }

  updateRelationID(relationID: string) {
    this.theSelectedRelation.RELATION_ID = relationID;
    this.selectedRelationSource.next(this.theSelectedRelation);
  }

  updateRelationDesc(relationDesc: string) {
    this.theSelectedRelation.RELATION_DESC = relationDesc;
    this.selectedRelationSource.next(this.theSelectedRelation);
  }

  setSelectedRelation(relation: Relation): void {
    this.theSelectedRelation = relation;
  }

  updateRelationshipID(relationshipID: string) {
    this.theSelectedRelationship.RELATIONSHIP_ID = relationshipID;
    this.selectedRelationshipSource.next(this.theSelectedRelationship);
  }

  updateRelationshipDesc(relationshipDesc: string) {
    this.theSelectedRelationship.RELATIONSHIP_DESC = relationshipDesc;
    this.selectedRelationshipSource.next(this.theSelectedRelationship);
  }

  setSelectedRelationship(relationship: RelationshipH): void {
    this.theSelectedRelationship = relationship;
  }

  updateRoleID(roleID: string) {
    this.theSelectedRole.ROLE_ID = roleID;
    this.selectedRoleSource.next(this.theSelectedRole);
  }

  updateRoleDesc(roleDesc: string) {
    this.theSelectedRole.ROLE_DESC = roleDesc;
    this.selectedRoleSource.next(this.theSelectedRole);
  }

  setSelectedRole(role: RoleH): void {
    this.theSelectedRole = role;
  }

  sendDialogAnswer(answer: string): void {
    this.dialogAnswer.next(answer);
  }
}
