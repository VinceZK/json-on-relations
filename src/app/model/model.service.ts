import { Injectable } from '@angular/core';
import {EntityType, Relation, RelationshipH, RoleH, DataDomainH, DataElementH} from 'jor-angular';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  dataTypes = [
    {key: 1, value: 'Char'},
    {key: 2, value: 'Integer'},
    {key: 3, value: 'Boolean'},
    {key: 4, value: 'Decimal'},
    {key: 5, value: 'String'},
    {key: 6, value: 'Binary'},
    {key: 7, value: 'Date'},
    {key: 8, value: 'Timestamp'}
  ];

  private dialogAnswer = new Subject<string>();
  dialogAnswer$ = this.dialogAnswer.asObservable();

  private isSearchListShown = new Subject<boolean>();
  isSearchListShown$ = this.isSearchListShown.asObservable();

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

  private theSelectedDataElement: DataElementH;
  private selectedDataElementSource = new Subject<DataElementH>();
  theSelectedDataElement$ = this.selectedDataElementSource.asObservable();

  private theSelectedDataDomain: DataDomainH;
  private selectedDataDomainSource = new Subject<DataDomainH>();
  theSelectedDataDomain$ = this.selectedDataDomainSource.asObservable();

  showSearchList(): void {
    this.isSearchListShown.next(true);
  }

  hideSearchList(): void {
    this.isSearchListShown.next(false);
  }
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

  updateDataElementID(elementID: string) {
    this.theSelectedDataElement.ELEMENT_ID = elementID;
    this.selectedDataElementSource.next(this.theSelectedDataElement);
  }

  updateDataElementDesc(elementDesc: string) {
    this.theSelectedDataElement.ELEMENT_DESC = elementDesc;
    this.selectedDataElementSource.next(this.theSelectedDataElement);
  }

  setSelectedDataElement(element: DataElementH): void {
    this.theSelectedDataElement = element;
  }

  updateDataDomainID(domainID: string) {
    this.theSelectedDataDomain.DOMAIN_ID = domainID;
    this.selectedDataDomainSource.next(this.theSelectedDataDomain);
  }

  updateDataDomainDesc(domainDesc: string) {
    this.theSelectedDataDomain.DOMAIN_DESC = domainDesc;
    this.selectedDataDomainSource.next(this.theSelectedDataDomain);
  }

  setSelectedDataDomain(domain: DataDomainH): void {
    this.theSelectedDataDomain = domain;
  }

  sendDialogAnswer(answer: string): void {
    this.dialogAnswer.next(answer);
  }
}
