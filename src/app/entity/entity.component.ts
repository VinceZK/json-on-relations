import { Component, OnInit } from '@angular/core';
import {EntityService} from '../entity.service';
import {Attribute, Entity, EntityMeta, EntityRelation, RelationMeta, Relationship, RelationshipMeta} from '../entity';
import {forkJoin} from 'rxjs';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {AttributeControlService} from '../attribute/attribute-control.service';
import {MessageService} from 'ui-message/dist/message';
import {msgStore} from '../msgStore';

@Component({
  selector: 'app-entity',
  templateUrl: './entity.component.html',
  styleUrls: ['./entity.component.css']
})
export class EntityComponent implements OnInit {
  entityIDs;
  newEntityID;
  entityMeta: EntityMeta;
  entity: Entity;
  changedEntity: Entity;
  relationMetas: RelationMeta[];
  entityRelations: EntityRelation[];
  formGroup: FormGroup;
  readonly = true;
  isRelationshipModalShown = false;
  isNewModelShown = false;
  toBeAddRelationship: Relationship;

  constructor(private fb: FormBuilder,
              private attributeControlService: AttributeControlService,
              private messageService: MessageService,
              private entityService: EntityService) {
    this.formGroup = this.fb.group({});
    this.messageService.setMessageStore(msgStore, 'EN');
    this.toBeAddRelationship = new Relationship();
  }

  ngOnInit() {
    const entityMeta$ = this.entityService.getEntityMeta('person');
    const entityInstance$ = this.entityService.getEntityInstance('64FA60509D6811E8BFADE5B8C5C70BD8');
    const relationMetas$ = this.entityService.getRelationMetaOfEntity('person');
    const combined$ = forkJoin(entityMeta$, entityInstance$, relationMetas$);

    combined$.subscribe(value => {
      this.entityMeta = value[0];
      this.entity = value[1];
      this.relationMetas = value[2];
      // console.log(this.entity);
      // console.log(this.entityMeta);
      this._createFormFromMeta();
    });
  }

  get displayRelationshipModal() {return this.isRelationshipModalShown ? 'block' : 'none'; }
  get displayNewModal() {return this.isNewModelShown ? 'block' : 'none'; }

  toggleEditDisplay(): void {
    this.readonly = !this.readonly;
  }

  saveEntity(): void {
    this.messageService.clearMessages();
    this._composeChangedEntity();
    console.log(this.changedEntity);

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
    this.entity = new Entity();
    this.entity.ENTITY_ID = this.newEntityID;
    this.entity.relationships = [];
    this.formGroup = this.fb.group({});
    this._createFormFromMeta();
    this.readonly = false;
    this.isNewModelShown = false;
  }

  openNewModal(): void {
    const entityIDs$ = this.entityService.listEntityID();
    entityIDs$.subscribe(value => {
      this.entityIDs = value;
      this.newEntityID = this.entity.ENTITY_ID;
      this.isNewModelShown = true;
    });
  }

  closeNewModal(): void {
    this.isNewModelShown = false;
  }

  openAddRelationshipModal(): void {
    this.messageService.clearMessages();
    this.toBeAddRelationship = new Relationship();
    this.isRelationshipModalShown = true;
  }

  closeAddRelationshipModal(): void {
    this.isRelationshipModalShown = false;
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

  _composeChangedEntity() {
    if (this.formGroup.dirty === false) {
      return; // Nothing is changed
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

    const changedRelationships = [];
    this.entity.relationships.forEach(relationship => {
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
  }

  _composeChangedPropertyValue(key, control: FormControl) {
    const attributeMeta = this.entityMeta.ATTRIBUTES.find(attribute => attribute.ATTR_NAME === key);
    this.changedEntity[key] = attributeMeta.IS_MULTI_VALUE ? control.value.split(',') : control.value;
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
            changedLine[primaryKey.ATTR_NAME] = relationFormGroup.value[primaryKey.ATTR_NAME];
          });
          return found;
        });

        if (index === -1) { // New line
          changedLine['action'] = 'add';
        } else {
          changedLine['action'] = 'update';
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
    this.entityMeta.ATTRIBUTES.forEach(attribute => {
      this.formGroup.addControl(attribute.ATTR_NAME,
        this.attributeControlService.convertToFormControl(attribute, this.entity));
    });

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
    const relationMetas = this.relationMetas;
    const entity = this.entity;
    this.entityMeta.ROLES.forEach(function (role) {
      role.RELATIONS.forEach(function (relation) {
        const entityRelation = new EntityRelation;
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
    if (data['ENTITY_ID']) {
      this.readonly = true;
      this.entity = data;
      this.formGroup.reset(this.formGroup.value); // TODO Address ID doesn't get refreshed
      this.messageService.reportMessage('ENTITY', 'ENTITY_SAVED', 'S');
    } else {
      if (data instanceof Array) {
        data.forEach(err => this.messageService.add(err));
      } else {
        this.messageService.report(data);
      }
    }
  }

}
