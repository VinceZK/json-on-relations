import { Injectable } from '@angular/core';
import {FormArray, FormGroup} from '@angular/forms';
import {PartnerRole} from './entity';

@Injectable({
  providedIn: 'root'
})
export class UiMapperService {

  constructor() { }

  /**
   * Map a FormGroup to a JOR relation(with cardinality [0..1] and [1..1]) for adding or updating.
   * @param formGroup: It must be a flat Angular FormGroup, which means no deep structure.
   * @param keys: Business primary keys to identify one row in the relation(DB table).
   * For example: Given {USER_ID: 'DH001'}, it means the relation has the primary key 'USER_ID'.
   * And it must be filled with a fix value 'DH001'.
   * However, if the value of the key can be derived from the formGroup, then assign null value to it.
   * For example: Given {EMAIL: null}, the value of key EMAIL will be derived from formGroup.value['EMAIL'].
   * @param isNew: Determine whether to update or add the value.
   *
   * The return is an object like:
   * {
   *     action: 'update', USER_ID: 'DH001', MIDDLE_NAME: "xxxxxx"
   * }
   */
  composeChangedRelation(formGroup: FormGroup, keys: {}, isNew: boolean = true): object {
    if (!formGroup.dirty || !keys || Object.keys(keys).length === 0) {
      return {};
    }
    const changedRelation = {action: isNew ? 'add' : 'update'};
    Object.keys(keys).forEach( key => changedRelation[key] = keys[key] || formGroup.value[key]);
    Object.keys(formGroup.controls).forEach( key => {
      const control = formGroup.get(key);
      if (control.dirty) { changedRelation[key] = control.value; }
    });
    return changedRelation;
  }

  /**
   * Map a FormArray to JOR relation(with cardinality [0..n] or [1..n]) for adding, updating, or deletion.
   * @param formArray: It must be a flat Angular FormArray, which means no deep structure.
   * @param originalArray: To determine whether an item is for adding, or for updating, or for deletion.
   * the original array, which shares the same structure with the formArray, is used for comparison.
   * Tips: You can get the originalArray by calling *FormArray.getRawValue()* right after
   * the FormArray is constructed from the backend data, usually, in ngOnInit().
   * @param keys: Business primary keys to identify one row in the formArray and originalArray.
   * For example: Given {EMAIL: null}, it will use the attribute EMAIL to compare if the same item exists or not.
   * First it iterates the formArray to whether check EMAIL exists in the originalArray,
   * if exists, use action 'update', otherwise, use action 'add'.
   * Then it iterates the originalArray to check EMAIL exists in formArray,
   * if not exists, then the action is set to 'delete'.
   *
   * The return is an array like:
   * [
   *   {action: "update", EMAIL: "dh003@hotmail.com", PRIMARY: 1},
   *   {action: "add", EMAIL: "dh003@gmail.com", TYPE: "work"},
   *   {action: "delete", EMAIL: "dh003@darkhouse.com"}
   * ]
   */
  composeChangedRelationArray(formArray: FormArray, originalArray: object[], keys: {}): object[] {
    if (!formArray.dirty || !keys || Object.keys(keys).length === 0) {
      return [];
    }
    if (!originalArray) { originalArray = []; }
    const changedRelationArray = [];
    formArray.controls.forEach( formGroup => {
      if (formGroup.dirty) {
        const changedRelation = {};
        changedRelationArray.push(changedRelation);
        const index = originalArray.findIndex(element => {
          let found = true;
          Object.keys(keys).forEach(key => {
            if (keys[key]) {return; }
            found = found && (element[key] === formGroup.value[key]);
          });
          return found;
        });
        changedRelation['action'] = index === -1 ? 'add' : 'update';
        Object.keys(keys).forEach( key => changedRelation[key] = keys[key] || formGroup.value[key]);
        Object.keys(formGroup['controls']).forEach( key => {
          const control = formGroup.get(key);
          if (control.dirty) { changedRelation[key] = control.value; }
        });
      }
    });
    originalArray.forEach( originalRelation => {
      const index = formArray.controls.findIndex(element => {
        let found = true;
        Object.keys(keys).forEach(key => {
          if (keys[key]) {return; }
          found = found && (element.value[key] === originalRelation[key]);
        });
        return found;
      });
      if (index === -1) {
        const deletedRelation = {action: 'delete'};
        Object.keys(keys).forEach( key => deletedRelation[key] = keys[key] || originalRelation[key]);
        changedRelationArray.push(deletedRelation);
      }
    });
    return changedRelationArray;
  }

  /**
   * Map a FormArray to JOR relationships for adding, updating, or deletion.
   * @param relationshipID: Relationship ID defined in JOR. For example: 'rs_marriage'
   * @param partnerRoles: Partner roles involved in the relationship.
   * For example: Given [{ENTITY_ID: 'person', ROLE_ID: 'wife'}], it means the partner is a 'person' with role 'wife'.
   * In most cases, a relationship only involves 2 roles, like husband and wife.
   * However, in certain case, there could be more than two. So the partner role is provided as an array.
   * @param formArray: First, it must be a flat Angular FormArray, which means no deep structure.
   * Second, it must contain fields: RELATIONSHIP_INSTANCE_GUID and <partner_role_name>_INSTANCE_GUID.
   * @param originalArray: To determine whether an item is for adding, or for updating, or for deletion.
   * the original array, which shares the same structure with the formArray, is used for comparison.
   * Tips: You can get the originalArray by calling *FormArray.getRawValue()* right after
   * the FormArray is constructed from the backend data, usually, in ngOnInit().
   * @param nonRelationshipAttributes: Attributes that are not belong to the relationship, but exist in the formArray.
   * A relationship has its own attributes, for example, rs_marriage has REG_PLACE and COUNTRY.
   * However, on the UI, you not only want to show the 2 fields, but also the partner's ID, NAME, BIRTHDAY, and so on.
   * And these attributes should be excluded when adding and changing the relationship.
   *
   * The Return will either a null object or a relationship object like:
   * {
   *   RELATIONSHIP_ID: "rs_marriage",
   *   values: [
   *     {action: "add", REG_PLACE: "Shanghai", COUNTRY: "China",
   *      PARTNER_INSTANCES: [
   *       {ENTITY_ID: "person", ROLE_ID: "wife", INSTANCE_GUID: "391E75B02A1811E981F3C33C6FB0A7C1"}
   *     ]},
   *     {action: "update", REG_PLACE: "Beijing", RELATIONSHIP_INSTANCE_GUID: "96DF7F706EE011E9B7B5F7E76DA40E87"},
   *     {action: "delete", RELATIONSHIP_INSTANCE_GUID: "96DF7F706EE011E9B7B5F7E76DA40E87"}
   *   ]
   * }
   */
  composeChangedRelationship(relationshipID: string, partnerRoles: PartnerRole[], formArray: FormArray,
                             originalArray: object[], nonRelationshipAttributes: string[]): object {
    if (!formArray.dirty) {
      return null;
    }

    const relationship = {
      RELATIONSHIP_ID: relationshipID,
      values: []
    };
    formArray.controls.forEach( formGroup => {
      if (formGroup.dirty) {
        const changedRelationshipValue = {};
        relationship.values.push(changedRelationshipValue);
        if (formGroup.value['RELATIONSHIP_INSTANCE_GUID']) {
          changedRelationshipValue['action'] = 'update';
          changedRelationshipValue['RELATIONSHIP_INSTANCE_GUID'] = formGroup.value['RELATIONSHIP_INSTANCE_GUID'];
        } else {
          changedRelationshipValue['action'] = 'add';
          changedRelationshipValue['PARTNER_INSTANCES'] = [];
          partnerRoles.forEach(partnerRole =>
            changedRelationshipValue['PARTNER_INSTANCES'].push(
              {
                ENTITY_ID: partnerRole.ENTITY_ID,
                ROLE_ID: partnerRole.ROLE_ID,
                INSTANCE_GUID: formGroup.value[partnerRole.ROLE_ID + '_INSTANCE_GUID']
              })
          );
        }
        Object.keys(formGroup['controls']).forEach(key => {
          if (nonRelationshipAttributes.includes(key) || key.substr(-13) === 'INSTANCE_GUID') {
            return;
          }
          const control = formGroup.get(key);
          if (control.dirty) {
            changedRelationshipValue[key] = control.value;
          }
        });
      }
    });
    originalArray.forEach(original => {
      if (formArray.controls.findIndex(
        formGroup => formGroup.value['RELATIONSHIP_INSTANCE_GUID'] === original['RELATIONSHIP_INSTANCE_GUID']) === -1) {
        relationship.values.push({action: 'delete', RELATIONSHIP_INSTANCE_GUID: original['RELATIONSHIP_INSTANCE_GUID']});
      }
    });
    return relationship.values.length === 0 ? null : relationship;
  }
}
