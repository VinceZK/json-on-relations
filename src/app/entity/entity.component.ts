import { Component, OnInit } from '@angular/core';
import {EntityService} from '../entity.service';
import {Attribute, Entity, EntityMeta, EntityRelation, RelationMeta, Relationship, RelationshipMeta} from '../entity';
import {forkJoin, of} from 'rxjs';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {AttributeControlService} from './attribute/attribute-control.service';
import {Message, MessageService} from 'ui-message-angular';
import {msgStore} from '../msgStore';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
  styleUrls: ['./entity.component.css']
})
export class EntityComponent implements OnInit {
  entityMeta: EntityMeta;
  entity: Entity;
  changedEntity: Entity;
  relationMetas: RelationMeta[];
  entityRelations: EntityRelation[];
  formGroup: FormGroup;
  readonly = true;
  isRelationshipModalShown = false;
  isEntityJSONModalShown = false;
  toBeAddRelationship: Relationship;

  constructor(private fb: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private attributeControlService: AttributeControlService,
              private messageService: MessageService,
              private entityService: EntityService) {
    this.formGroup = this.fb.group({});
    this.messageService.setMessageStore(msgStore, 'EN');
    this.toBeAddRelationship = new Relationship();
  }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const instanceGUID = params.get('instanceGUID');
        this.entityMeta = null;
        if (instanceGUID === 'new') {
          this.readonly = false;
          this.entity = new Entity();
          this.entity.ENTITY_ID = params.get('entityID');
          this.entity.relationships = [];
          return of([this.entity]);
        } else {
          this.readonly = true;
          return this.entityService.getEntityInstance(instanceGUID);
        }
      }),
      switchMap(data => {
        let entityMeta$ = of({});
        let relationMetas$ = of([]);
        let errMessages$ = of([]);
        if (data[0]['ENTITY_ID']) {
          this.entity = data[0] as Entity;
          entityMeta$ = this.entityService.getEntityMeta(this.entity.ENTITY_ID);
          relationMetas$ = this.entityService.getRelationMetaOfEntity(this.entity.ENTITY_ID);
        } else {
          errMessages$ = of(data);
        }
        return forkJoin(entityMeta$, relationMetas$, errMessages$);
      })
    ).subscribe(data => {
        if (data[2].length > 0) {
          data[2].forEach(err => this.messageService.add(err as Message));
        } else {
          this.entityMeta = <EntityMeta>data[0];
          this.relationMetas = <RelationMeta[]>data[1];
          this.formGroup = this.fb.group({});
          this._createFormFromMeta();
        }
    });

  }

  get displayRelationshipModal() {return this.isRelationshipModalShown ? 'block' : 'none'; }
  get displayEntityJSONModal() {return this.isEntityJSONModalShown ? 'block' : 'none'; }
  get entityAttributes() { return this.relationMetas.find(
    relationMeta => relationMeta.RELATION_ID === this.entity.ENTITY_ID).ATTRIBUTES; }

  toggleEditDisplay(): void {
    this.readonly = !this.readonly;
  }

  saveEntity(): void {
    this.messageService.clearMessages();
    if (!this._composeChangedEntity()) {
      this.readonly = true;
      this.messageService.reportMessage('ENTITY', 'NO_CHANGE', 'S');
      return;
    }

    // console.log(this.changedEntity);
    if (this.entity.INSTANCE_GUID) {
      this.entityService.changeEntityInstance(this.changedEntity).subscribe(data => {
        this._postActivityAfterSaving(data);
      });
    } else {
      this.entityService.createEntityInstance(this.changedEntity).subscribe(data => {
        this._postActivityAfterSaving(data);
      });
    }
    window.scroll(0, 0);
  }

  newEntity(): void {
    this.router.navigate(['/entity/new', {entityID: this.entityMeta.ENTITY_ID}]);
  }

  openAddRelationshipModal(): void {
    this.messageService.clearMessages();
    this.toBeAddRelationship = new Relationship();
    this.isRelationshipModalShown = true;
  }

  closeAddRelationshipModal(): void {
    this.isRelationshipModalShown = false;
  }

  openEntityJSONModal(): void {
    this.isEntityJSONModalShown = true;
  }

  closeEntityJSONModal(): void {
    this.isEntityJSONModalShown = false;
  }

  clearRelationshipID(): void {
    delete this.toBeAddRelationship.RELATIONSHIP_ID;
  }

  addRelationship(): void {
    if (!this.toBeAddRelationship.RELATIONSHIP_ID) {
      this.messageService.reportMessage('RELATIONSHIP', 'RELATIONSHIP_MANDATORY', 'E');
      return;
    }
    const index = this.entity.relationships.findIndex(
      relationship => relationship.RELATIONSHIP_ID === this.toBeAddRelationship.RELATIONSHIP_ID);
    if (index !== -1) {
      this.messageService.reportMessage(
        'RELATIONSHIP', 'RELATIONSHIP_ALREADY_EXISTS', 'E', this.toBeAddRelationship.RELATIONSHIP_ID);
    } else {
      this.entity.relationships.push(this.toBeAddRelationship);
      this.isRelationshipModalShown = false;
    }
  }

  getRelationshipsMeta(roleID: string): RelationshipMeta[] {
    const roleMeta = this.entityMeta.ROLES.find(role => role.ROLE_ID === roleID);
    return roleMeta.RELATIONSHIPS;
  }

  getRelationshipMeta(relationshipID: string): RelationshipMeta {
    let relationshipIndex = -1;
    const roleIndex = this.entityMeta.ROLES.findIndex( role => {
      relationshipIndex =
        role.RELATIONSHIPS.findIndex(relationship => relationship.RELATIONSHIP_ID === relationshipID);
      if (relationshipIndex !== -1) {
        return true;
      }
    });

    return this.entityMeta.ROLES[roleIndex].RELATIONSHIPS[relationshipIndex];
  }

  getRelationshipAttributes(relationshipID: string): RelationMeta {
    return this.relationMetas.find(
      relationMeta => relationshipID === relationMeta.RELATION_ID
    );
  }

  _composeChangedEntity(): boolean {
    if (this.formGroup.dirty === false) {
      return false; // Nothing is changed
    }

    this.changedEntity = new Entity();
    this.changedEntity.ENTITY_ID = this.entity.ENTITY_ID;
    this.changedEntity.INSTANCE_GUID = this.entity.INSTANCE_GUID;

    Object.keys(this.formGroup.controls).forEach(key => {
      const control = this.formGroup.controls[key];

      if (control instanceof FormControl && control.dirty === true) {
        this._composeChangedPropertyValue(key, control);
      } else if (control instanceof FormGroup && control.dirty === true) {
        this.entity.INSTANCE_GUID ? this._composeChangedSingleValueRelation(key, control.controls) :
                                    this._composeNewSingleValueRelation(key, control.controls);
      } else if (control instanceof FormArray && control.dirty === true) {
        this.entity.INSTANCE_GUID ? this._composeChangedMultiValueRelation(key, control.controls) :
                                    this._composeNewMultiValueRelation(key, control.controls);
      }
    });

    if (!this.entity.relationships) { return true; }
    const changedRelationships = [];
    this.entity.relationships.forEach(relationship => {
      if (!relationship.values) { return; }
      const changedRelationship = new Relationship();
      changedRelationship.RELATIONSHIP_ID = relationship.RELATIONSHIP_ID;
      changedRelationship.SELF_ROLE_ID = relationship.SELF_ROLE_ID;
      changedRelationship.values = [];
      if (!this.entity.INSTANCE_GUID) { // Create a new entity
        relationship.values.forEach( value => {
           if (value.action === 'add' || value.action === 'update' || value.action === 'extend') {
             const copyValue = { ...value };
             copyValue['action'] = 'add';
             changedRelationship.values.push(copyValue);
           }
        });
      } else {
        relationship.values.forEach(value => {
          if (value.action) {
            changedRelationship.values.push(value);
          }
        });
      }
      if ( changedRelationship.values.length > 0 ) {
        changedRelationships.push(changedRelationship);
      }
    });
    if ( changedRelationships.length > 0 ) {
      this.changedEntity.relationships = changedRelationships;
    }

    return true;
  }

  _composeChangedPropertyValue(key, control: FormControl) {
    // const attributeMeta = this.entityAttributes.find(attribute => attribute.ATTR_NAME === key);
    this.changedEntity[key] = control.value;
  }

  _composeChangedSingleValueRelation(key, attrControls) {
    this.changedEntity[key] = {};
    if (this.entity[key]) { // Relation instance exists before
      this._getPrimaryKeys(key).forEach(primaryKey => {
        this.changedEntity[key][primaryKey.ATTR_NAME] = this.entity[key][0][primaryKey.ATTR_NAME];
      });

      if (Object.keys(attrControls).length === 0) {
        this.changedEntity[key]['action'] = 'delete';
      } else {
        this.changedEntity[key]['action'] = 'update';
      }
    } else { // Relation instance doesn't exist before
      if (Object.keys(attrControls).length !== 0) {
        this.changedEntity[key]['action'] = 'add';
      }
    }

    if (this.changedEntity[key].action === 'update' || this.changedEntity[key].action === 'add') {
      Object.keys(attrControls).forEach(attrName => {
        const attrControl = attrControls[attrName];
        if (attrControl.dirty === true) {
          this.changedEntity[key][attrName] = attrControl.value;
        }
      });
    }
  }

  _composeNewSingleValueRelation(key, attrControls) {
    if (Object.keys(attrControls).length === 0) { return; }
    this.changedEntity[key] = {};
    Object.keys(attrControls).forEach(attrName => {
      const attrControl = attrControls[attrName];
      if (attrControl.dirty === true) {
        this.changedEntity[key][attrName] = attrControl.value;
      }
    });
  }

  _composeChangedMultiValueRelation(key, relationControls) {
    const originalLines = this.entity[key];
    const primaryKeys = this._getPrimaryKeys(key);

    this.changedEntity[key] = [];
    relationControls.forEach(relationFormGroup => {
      const changedLine = {};
      if (relationFormGroup.dirty) {
        const index = originalLines.findIndex( line => {
          let found = false;
          primaryKeys.forEach(primaryKey => {
            found = line[primaryKey.ATTR_NAME] === relationFormGroup.value[primaryKey.ATTR_NAME];
          });
          return found;
        });

        if (index === -1) { // New line
          changedLine['action'] = 'add';
          primaryKeys.forEach( primaryKey => {
            if (!primaryKey.AUTO_INCREMENT) {
              changedLine[primaryKey.ATTR_NAME] = relationFormGroup.value[primaryKey.ATTR_NAME];
            }
          });
        } else {
          changedLine['action'] = 'update';
          primaryKeys.forEach( primaryKey => {
            changedLine[primaryKey.ATTR_NAME] = relationFormGroup.value[primaryKey.ATTR_NAME];
          });
        }

        Object.keys(relationFormGroup.controls).forEach(attrName => {
          const attrControl = relationFormGroup.controls[attrName];
          if (attrControl.dirty === true) {
            changedLine[attrName] = attrControl.value;
          }
        });

        this.changedEntity[key].push(changedLine);
      }
    });

    originalLines.forEach(line => {
      if (Object.keys(line).length === 0) {return; }
      const deleteLine = {action: 'delete'};
      const index = relationControls.findIndex( relationFormGroup => {
        let found = false;
        primaryKeys.forEach(primaryKey => {
          found = line[primaryKey.ATTR_NAME] === relationFormGroup.value[primaryKey.ATTR_NAME];
        });
        return found;
      });

      if (index === -1) { // Original item is not found in the UI
        primaryKeys.forEach(primaryKey => {
          deleteLine[primaryKey.ATTR_NAME] = line[primaryKey.ATTR_NAME];
        });
        this.changedEntity[key].push(deleteLine);
      }

    });
  }

  _composeNewMultiValueRelation(key, relationControls) {
    if (relationControls.length === 0) { return; }

    this.changedEntity[key] = [];
    relationControls.forEach(relationFormGroup => {
      const changedLine = {};
      if (relationFormGroup.dirty) {
        Object.keys(relationFormGroup.controls).forEach(attrName => {
          const attrControl = relationFormGroup.controls[attrName];
          if (attrControl.dirty === true) {
            changedLine[attrName] = attrControl.value;
          }
        });
        this.changedEntity[key].push(changedLine);
      }
    });
  }

  _getPrimaryKeys(relation): Attribute[] {
    return this.entityRelations.find(ele => {
      return ele.RELATION_ID === relation;
    }).ATTRIBUTES.filter( attribute => attribute.PRIMARY_KEY );
  }

  _createFormFromMeta() {
    this.entityRelations = this._getEntityRelations();
    this.entityRelations.forEach(relation => {
      switch (relation.CARDINALITY) {
        case '[0..1]':
          if (relation.EMPTY) {
            this.entity[relation.RELATION_ID] = [{}];
            this.formGroup.addControl(relation.RELATION_ID, new FormGroup({}));
          } else {
            this.formGroup.addControl(relation.RELATION_ID,
              this.attributeControlService.convertToFormGroup(relation.ATTRIBUTES, this.entity[relation.RELATION_ID][0]));
          }
          break;
        case '[1..1]':
          if (relation.EMPTY) {
            this.entity[relation.RELATION_ID] = [{}];
            relation.EMPTY = false;
          }
          this.formGroup.addControl(relation.RELATION_ID,
              this.attributeControlService.convertToFormGroup(relation.ATTRIBUTES, this.entity[relation.RELATION_ID][0]));
          break;
        case '[0..n]':
          if (relation.EMPTY) {
            this.entity[relation.RELATION_ID] = [{}];
            this.formGroup.addControl(relation.RELATION_ID, new FormArray([]));
          } else {
            this.formGroup.addControl(relation.RELATION_ID,
              this._convertToFormArray(relation.ATTRIBUTES, this.entity[relation.RELATION_ID]));
          }
          break;
        case '[1..n]':
          if (relation.EMPTY) {
            this.entity[relation.RELATION_ID] = [{}];
            relation.EMPTY = false;
          }
          this.formGroup.addControl(relation.RELATION_ID,
            this._convertToFormArray(relation.ATTRIBUTES, this.entity[relation.RELATION_ID]));
          break;
      }
    });
  }

  _getEntityRelations(): EntityRelation[] {
    const entityRelations: EntityRelation[] = [];
    const entity = this.entity;

    let entityRelation = new EntityRelation;
    entityRelation.ROLE_ID = this.entity.ENTITY_ID;
    entityRelation.RELATION_ID = this.entity.ENTITY_ID;
    entityRelation.CARDINALITY = '[1..1]';
    entityRelation.EMPTY = !entity[this.entity.ENTITY_ID];
    entityRelation.ATTRIBUTES = this.entityAttributes;
    entityRelations.push(entityRelation);

    const relationMetas = this.relationMetas;
    this.entityMeta.ROLES.forEach(function (role) {
      role.RELATIONS.forEach(function (relation) {
        entityRelation = new EntityRelation;
        entityRelation.ROLE_ID = role.ROLE_ID;
        entityRelation.RELATION_ID = relation.RELATION_ID;
        entityRelation.CARDINALITY = relation.CARDINALITY;
        entityRelation.EMPTY = !entity[relation.RELATION_ID];
        entityRelation.ATTRIBUTES = relationMetas.find(ele => {
          return ele.RELATION_ID === relation.RELATION_ID;
        }).ATTRIBUTES;
        entityRelations.push(entityRelation);
      });
    });
    return entityRelations;
  }

  _convertToFormArray(attributes: Attribute[], instance: any) {
    const formArray = [];
    instance.forEach( line => {
      formArray.push(this.attributeControlService.convertToFormGroup(attributes, line));
    });
    return new FormArray(formArray);
  }

  _postActivityAfterSaving(data: any) {
    if (data[0]['ENTITY_ID']) {
      this.readonly = true;
      this.entity = data[0];
      this._refreshFormGroupValue(this.entity);
      this.formGroup.reset(this.formGroup.value);
      this.messageService.reportMessage('ENTITY', 'ENTITY_SAVED', 'S');
    } else {
      // Error messages are always an array
      data.forEach(err => this.messageService.add(err));
    }
  }

  _refreshFormGroupValue(entity: Entity) {
    const formGroupValues = {};
    if (!this.entityRelations) { this.entityRelations = this._getEntityRelations(); }
    this.entityRelations.forEach(entityRelation => {
      if ( entityRelation.CARDINALITY === '[0..1]' || entityRelation.CARDINALITY === '[1..1]') {
        formGroupValues[entityRelation.RELATION_ID] =
          entity[entityRelation.RELATION_ID] ? entity[entityRelation.RELATION_ID][0] : {};
      } else {
        formGroupValues[entityRelation.RELATION_ID] =
          entity[entityRelation.RELATION_ID] ? entity[entityRelation.RELATION_ID] : [];
      }
    });
    this.formGroup.setValue(formGroupValues);
  }

}
