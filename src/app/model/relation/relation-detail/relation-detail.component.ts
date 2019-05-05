import {Component, OnInit, ViewChild} from '@angular/core';
import {Association, RelationMeta} from 'jor-angular';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Message, MessageService} from 'ui-message-angular';
import {EntityService} from '../../../entity.service';
import {msgStore} from '../../../msgStore';
import {switchMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {AttributeMetaComponent} from '../../attribute-meta/attribute-meta.component';
import {ModelService} from '../../model.service';
import {DialogService} from '../../../dialog.service';
import {UniqueRelationValidator} from '../../model-validators';

@Component({
  selector: 'app-relation-detail',
  templateUrl: './relation-detail.component.html',
  styleUrls: ['./relation-detail.component.css']
})
export class RelationDetailComponent implements OnInit {
  relationMeta: RelationMeta;
  readonly = true;
  isNewMode = false;
  isFieldMapShown = false;
  relationForm: FormGroup;
  currentAssociationForm: AbstractControl;
  currentAssociation: Association;
  currentRightRelationMeta: RelationMeta;
  changedRelation = {};
  bypassProtection = false;

  @ViewChild(AttributeMetaComponent)
  private attrComponent: AttributeMetaComponent;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,
              private uniqueRelationValidator: UniqueRelationValidator,
              private messageService: MessageService,
              private modelService: ModelService,
              private dialogService: DialogService,
              private entityService: EntityService) {
    this.messageService.setMessageStore(msgStore, 'EN');
  }

  get associationFormArray() {
    return this.relationForm.get('ASSOCIATIONS') as FormArray;
  }
  get fieldMapFormArray() {
    if (this.currentAssociationForm) {
      return this.currentAssociationForm.get('FIELDS_MAPPING') as FormArray;
    } else {
      return null;
    }
  }
  get displayFieldMapModal() {
    return this.isFieldMapShown ? 'block' : 'none';
  }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const relationID = params.get('relationID');
        if (relationID === 'new') {
          const relation = new RelationMeta();
          relation.RELATION_ID = 'r_';
          relation.RELATION_DESC = '';
          relation.ATTRIBUTES = [];
          this.isNewMode = true;
          this.readonly = false;
          this.bypassProtection = false;
          return of(relation);
        } else {
          this.readonly = true;
          this.isNewMode = false;
          return this.entityService.getRelationMeta(params.get('relationID'));
        }
      })
    ).subscribe(data => {
      if ( 'RELATION_ID' in data) { // If the return data is a message
        this.messageService.clearMessages();
        this.relationMeta = <RelationMeta>data;
        this._generateRelationForm();
      } else {
        this.messageService.clearMessages();
        this.relationMeta = null;
        this.relationForm = null;
        if (data instanceof Array) {
          data.forEach(err => this.messageService.add(err));
        } else {
          this.messageService.report(<Message>data);
        }
      }
    });
  }

  _generateRelationForm(): void {
    this.relationForm = this.fb.group({});
    this.relationForm.addControl('RELATION_ID', new FormControl(this.relationMeta.RELATION_ID, {updateOn: 'blur'}));
    if (this.isNewMode) {
      this.relationForm.get('RELATION_ID').setValidators(this._validateRelationId);
      this.relationForm.get('RELATION_ID').setAsyncValidators(this.uniqueRelationValidator.validate.bind(this.uniqueRelationValidator));
    }
    this.relationForm.addControl('RELATION_DESC', new FormControl(this.relationMeta.RELATION_DESC));

    // Compose Associations
    const formArray = [];
    if (this.relationMeta.ASSOCIATIONS) {
      this.relationMeta.ASSOCIATIONS.forEach( association => {
        const fieldsMapArray = [];
        association.FIELDS_MAPPING.forEach( fieldsMap => {
          fieldsMapArray.push(this.fb.group({
            LEFT_FIELD: [fieldsMap.LEFT_FIELD],
            RIGHT_FIELD: [fieldsMap.RIGHT_FIELD]
          }));
        });
        formArray.push(this.fb.group({
          RIGHT_RELATION_ID: [association.RIGHT_RELATION_ID],
          CARDINALITY: [{value: association.CARDINALITY, disabled: this.readonly}],
          FOREIGN_KEY_CHECK: [{value: association.FOREIGN_KEY_CHECK, disabled: this.readonly}],
          FIELDS_MAPPING: this.fb.array(fieldsMapArray)
        }));
      });
    }

    if (this.isNewMode) {
      formArray.push(
        this.fb.group({
          RIGHT_RELATION_ID: [''],
          CARDINALITY: ['[0..1]'],
          FOREIGN_KEY_CHECK: [0],
          FIELDS_MAPPING: this.fb.array([
            this.fb.group({
              LEFT_FIELD: [''],
              RIGHT_FIELD: ['']
            })])
        }));
    }
    this.relationForm.addControl('ASSOCIATIONS', new FormArray(formArray));
  }

  _validateRelationId(c: FormControl) {
    if (c.value.trim() === '') {
      return {message: 'Relation ID is mandatory'};
    }

    if (c.value.toString().toLowerCase() === 'new') {
      return {message: '"NEW/new" is reserved, thus is not allowed to use!'};
    }

    if (c.value.toString().toLowerCase().substr(0, 2) !== 'r_') {
      return {message: 'Relation name must be started with "r_"!'};
    }

    if (c.value.toString().length < 3) {
      return {message: 'Relation name must have length larger than 2!'};
    }

    return null;
  }

  switchEditDisplay() {
    if (this.isNewMode) {
      this.dialogService.confirm('Discard the new Entity Type?').subscribe(confirm => {
        if (confirm) {
          this._switch2DisplayMode();
          this.relationMeta = null;
          this.modelService.sendDialogAnswer('OK');
        } else {
          this.modelService.sendDialogAnswer('CANCEL');
        }
      });
      return;
    }

    if (!this.readonly) { // In Change Mode -> Display Mode
      if (this.relationForm.dirty) {
        this.dialogService.confirm('Discard changes?').subscribe(confirm => {
          if (confirm) { // Discard changes and switch to Display Mode
            this._generateRelationForm();
            this.relationForm.reset(this.relationForm.value);
            this._switch2DisplayMode();
          }
        });
      } else { // Switch to display mode
        this._switch2DisplayMode();
      }
    } else { // In Display Mode -> Change Mode
      this.readonly = false;
      this.associationFormArray.controls.forEach(associationFormGroup => {
        associationFormGroup.get('CARDINALITY').enable();
        associationFormGroup.get('FOREIGN_KEY_CHECK').enable();
      });
      this.associationFormArray.push(
        this.fb.group({
          RIGHT_RELATION_ID: [''],
          CARDINALITY: ['[0..1]'],
          FOREIGN_KEY_CHECK: [0],
          FIELDS_MAPPING: this.fb.array([])
        }));
      this.attrComponent.switchEditDisplay(this.readonly);
    }
  }

  _switch2DisplayMode(): void {
    this.readonly = true;
    let lastIndex = this.associationFormArray.length - 1;
    while (lastIndex >= 0 && this.associationFormArray.controls[lastIndex].get('RIGHT_RELATION_ID').value.trim() === '') {
      this.associationFormArray.removeAt(lastIndex);
      lastIndex--;
    }
    this.associationFormArray.controls.forEach(associationFormGroup => {
      associationFormGroup.get('CARDINALITY').disable();
      associationFormGroup.get('FOREIGN_KEY_CHECK').disable();
    });
    this.attrComponent.switchEditDisplay(this.readonly);
  }

  onChangeRelationID(): void {
    this.modelService.updateRelationID(this.relationForm.get('RELATION_ID').value);
  }

  onChangeRelationDesc(): void {
    this.modelService.updateRelationDesc(this.relationForm.get('RELATION_DESC').value);
  }

  deleteAssociation(index: number): void {
    if (index !== this.associationFormArray.length - 1) {
      this.associationFormArray.removeAt(index);
      this.associationFormArray.markAsDirty();
    }
  }

  openFieldMapModal(index: number): void {
    this.currentAssociationForm = this.associationFormArray.controls[index];
    if (this.currentAssociationForm.get('RIGHT_RELATION_ID').value.trim() === '') {
      return;
    }

    this.entityService.getRelationMeta(this.currentAssociationForm.get('RIGHT_RELATION_ID').value)
      .subscribe( data => {
        this.currentRightRelationMeta = <RelationMeta>data;
      });

    if (this.readonly === false) {
      this.fieldMapFormArray.push(this.fb.group({LEFT_FIELD: [''], RIGHT_FIELD: ['']}));
    }
    this.currentAssociation = this.relationMeta.ASSOCIATIONS ? this.relationMeta.ASSOCIATIONS[index] : null;
    this.isFieldMapShown = true;
  }

  closeFieldMapModal(): void {
    // this.currentAssociationForm.setValue(this.currentAssociationForm.value); // Or the value won't be updated.
    let lastIndex = this.fieldMapFormArray.length - 1;
    while (lastIndex >= 0 && this.fieldMapFormArray.controls[lastIndex].get('RIGHT_FIELD').value.trim() === '') {
      this.fieldMapFormArray.removeAt(lastIndex);
      lastIndex--;
    }
    this.isFieldMapShown = false;
  }

  deleteFieldMap(index: number): void {
    if (index !== this.fieldMapFormArray.length - 1) {
      this.fieldMapFormArray.removeAt(index);
      this.fieldMapFormArray.markAsDirty();
    }
  }

  onChangeRightRelationID(index: number): void {
    const currentAssocFormGroup = this.associationFormArray.controls[index];

    if (currentAssocFormGroup.get('RIGHT_RELATION_ID').value === this.relationMeta.RELATION_ID) {
      currentAssocFormGroup.get('RIGHT_RELATION_ID').setErrors({message: 'Self association is not allowed'});
      return;
    }

    if (this.associationFormArray.controls.findIndex((assocCtrl, i) =>
      i !== index && assocCtrl.get('RIGHT_RELATION_ID').value === currentAssocFormGroup.get('RIGHT_RELATION_ID').value
    ) !== -1) {
      currentAssocFormGroup.get('RIGHT_RELATION_ID').setErrors({message: 'Duplicate associated relation'});
      return;
    }

    if (index === this.associationFormArray.length - 1 && currentAssocFormGroup.value.RIGHT_RELATION_ID.trim() !== '') {
      // Only work for the last New line
      this.associationFormArray.push(
        this.fb.group({
          RIGHT_RELATION_ID: [''],
          CARDINALITY: ['[0..1]'],
          FOREIGN_KEY_CHECK: [0],
          FIELDS_MAPPING: this.fb.array([])
        })
      );
    }

    this.entityService.getRelationDesc(currentAssocFormGroup.value.RIGHT_RELATION_ID)
      .subscribe(data => {
        if (data['msgCat']) {
          currentAssocFormGroup.get('RIGHT_RELATION_ID').setErrors({message: data['msgShortText']});
        }
    });
  }

  onChangeLeftField(index: number): void {
    const currentFieldMapFormGroup = this.fieldMapFormArray.controls[index];
    if (this.relationMeta.ATTRIBUTES.findIndex( attribute =>
        attribute.ATTR_NAME === currentFieldMapFormGroup.get('LEFT_FIELD').value) === -1) {
      currentFieldMapFormGroup.get('LEFT_FIELD').setErrors({message: 'Field Not Exist'});
      return;
    }

    if (this.fieldMapFormArray.controls.findIndex((fieldMapCtrl, i) =>
      i !== index && fieldMapCtrl.get('LEFT_FIELD') && fieldMapCtrl.get('RIGHT_FIELD') &&
      fieldMapCtrl.get('LEFT_FIELD').value === currentFieldMapFormGroup.get('LEFT_FIELD').value &&
      fieldMapCtrl.get('RIGHT_FIELD').value === currentFieldMapFormGroup.get('RIGHT_FIELD').value
    ) !== -1) {
      currentFieldMapFormGroup.get('LEFT_FIELD').setErrors({message: 'Duplicate Fields Mapping'});
      return;
    }

    if (index === this.fieldMapFormArray.length - 1 && currentFieldMapFormGroup.value.LEFT_FIELD.trim() !== '') {
      this.fieldMapFormArray.push(
        this.fb.group( {LEFT_FIELD: [''], RIGHT_FIELD: ['']})
      );
    }
  }

  onChangeRightField(index: number): void {
    const currentFieldMapFormGroup = this.fieldMapFormArray.controls[index];
    if (this.currentRightRelationMeta &&
        this.currentRightRelationMeta.ATTRIBUTES.findIndex( attribute =>
          attribute.ATTR_NAME === currentFieldMapFormGroup.get('RIGHT_FIELD').value) === -1) {
      currentFieldMapFormGroup.get('RIGHT_FIELD').setErrors({message: 'Field Not Exist'});
      return;
    }

    if (this.fieldMapFormArray.controls.findIndex((fieldMapCtrl, i) =>
      i !== index && fieldMapCtrl.get('LEFT_FIELD') && fieldMapCtrl.get('RIGHT_FIELD') &&
      fieldMapCtrl.get('LEFT_FIELD').value === currentFieldMapFormGroup.get('LEFT_FIELD').value &&
      fieldMapCtrl.get('RIGHT_FIELD').value === currentFieldMapFormGroup.get('RIGHT_FIELD').value
    ) !== -1) {
      currentFieldMapFormGroup.get('RIGHT_FIELD').setErrors({message: 'Duplicate Fields Mapping'});
      return;
    }

    if (index === this.fieldMapFormArray.length - 1 && currentFieldMapFormGroup.value.RIGHT_FIELD.trim() !== '') {
      this.fieldMapFormArray.push(
        this.fb.group( {LEFT_FIELD: [''], RIGHT_FIELD: ['']})
      );
    }
  }

  oldRightRelation(formGroup: AbstractControl): boolean {
    return this.relationMeta.ASSOCIATIONS ?
      this.relationMeta.ASSOCIATIONS.findIndex(
      association => association.RIGHT_RELATION_ID === formGroup.get('RIGHT_RELATION_ID').value ) !== -1 :
      false;
  }

  oldFieldMap(formGroup: AbstractControl): boolean {
    return this.currentAssociation ?
      this.currentAssociation.FIELDS_MAPPING.findIndex(
      fieldMap => fieldMap.LEFT_FIELD === formGroup.get('LEFT_FIELD').value &&
                            fieldMap.RIGHT_FIELD === formGroup.get('RIGHT_FIELD').value ) !== -1 :
      false;
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.isNewMode || (!this.bypassProtection && this.relationForm && this.relationForm.dirty)) {
      const dialogAnswer = this.dialogService.confirm('Discard changes?');
      dialogAnswer.subscribe(confirm => {
        if (confirm) {
          this.modelService.sendDialogAnswer('OK');
        } else {
          this.modelService.sendDialogAnswer('CANCEL');
        }
      });
      return dialogAnswer;
    } else {
      return true;
    }
  }

  save(): void {
    if (!this.relationForm.dirty) {
      return this.messageService.reportMessage('MODEL', 'NO_CHANGE', 'S');
    }

    if (!this.relationForm.valid) {
      return this.messageService.reportMessage('MODEL', 'INVALID_DATA', 'E');
    }

    if (this.isNewMode) {
      this.changedRelation['action'] = 'add';
      this.changedRelation['RELATION_ID'] = this.relationForm.controls['RELATION_ID'].value;
    } else {
      this.changedRelation['action'] = 'update';
      this.changedRelation['RELATION_ID'] = this.relationMeta.RELATION_ID;
    }
    if (this.relationForm.controls['RELATION_DESC'].dirty) {
      this.changedRelation['RELATION_DESC'] = this.relationForm.controls['RELATION_DESC'].value;
    }

    this.changedRelation['ATTRIBUTES'] = this.attrComponent.processChangedAttributes();
    this._processChangedAssociation();

    this.entityService.saveRelation(this.changedRelation)
      .subscribe(data => this._postActivityAfterSavingRelation(data));
  }

  _processChangedAssociation(): void {
    const changedAssociations = [];
    if (!this.associationFormArray.dirty) { return; }

    this.changedRelation['ASSOCIATIONS'] = changedAssociations;

    this.associationFormArray.controls.forEach(associationControl => {
      if (associationControl.get('RIGHT_RELATION_ID').value.trim() === '') { return; }
      const changedAssociation = {};
      const associationMeta = this.relationMeta.ASSOCIATIONS.find(
        association => associationControl.get('RIGHT_RELATION_ID').value === association.RIGHT_RELATION_ID);
      if (!associationMeta) {// New Add Case
        changedAssociation['action'] = 'add';
        changedAssociation['RIGHT_RELATION_ID'] = associationControl.get('RIGHT_RELATION_ID').value;
        changedAssociation['CARDINALITY'] = associationControl.get('CARDINALITY').value;
        changedAssociation['FOREIGN_KEY_CHECK'] = associationControl.get('FOREIGN_KEY_CHECK').value;
        changedAssociation['FIELDS_MAPPING'] = [];
        const fieldMapArray = associationControl.get('FIELDS_MAPPING') as FormArray;
        fieldMapArray.controls.forEach(fieldMap => {
          changedAssociation['FIELDS_MAPPING'].push(
            {action: 'add', RIGHT_FIELD: fieldMap.get('RIGHT_FIELD').value, LEFT_FIELD: fieldMap.get('LEFT_FIELD').value});
        });
        changedAssociations.push(changedAssociation);
      } else {
        if (associationControl.dirty) {// Change Case
          changedAssociation['action'] = 'update';
          changedAssociation['RIGHT_RELATION_ID'] = associationControl.get('RIGHT_RELATION_ID').value;
          if (associationControl.get('CARDINALITY').dirty) {
            changedAssociation['CARDINALITY'] = associationControl.get('CARDINALITY').value;
          }
          if (associationControl.get('FOREIGN_KEY_CHECK').dirty) {
            changedAssociation['FOREIGN_KEY_CHECK'] = associationControl.get('FOREIGN_KEY_CHECK').value;
          }
          if (associationControl.get('FIELDS_MAPPING').dirty) {
            changedAssociation['FIELDS_MAPPING'] = [];
            const fieldMapArray = associationControl.get('FIELDS_MAPPING') as FormArray;
            fieldMapArray.controls.forEach(fieldMap => {
              if (fieldMap.dirty) {
                changedAssociation['FIELDS_MAPPING'].push(
                  {action: 'add', RIGHT_FIELD: fieldMap.get('RIGHT_FIELD').value, LEFT_FIELD: fieldMap.get('LEFT_FIELD').value});
              }
            });
            associationMeta.FIELDS_MAPPING.forEach( oldFieldMap => {
              const index = fieldMapArray.controls.findIndex(fieldMap =>
                fieldMap.get('LEFT_FIELD').value === oldFieldMap.LEFT_FIELD &&
                fieldMap.get('RIGHT_FIELD').value === oldFieldMap.RIGHT_FIELD);
              if (index === -1) {
                changedAssociation['FIELDS_MAPPING'].push(
                  {action: 'delete', RIGHT_FIELD: oldFieldMap.LEFT_FIELD, LEFT_FIELD: oldFieldMap.RIGHT_FIELD});
              }
            });
          }
          changedAssociations.push(changedAssociation);
        }
      }
    });

    // Deletion Case
    this.relationMeta.ASSOCIATIONS.forEach(associationMeta => {
      const index = this.associationFormArray.controls.findIndex(
        associationControl => associationControl.get('RIGHT_RELATION_ID').value === associationMeta.RIGHT_RELATION_ID);
      if (index === -1) { // The association must be deleted
        changedAssociations.push({action: 'delete', RIGHT_RELATION_ID: associationMeta.RIGHT_RELATION_ID});
      }
    });
  }


  _postActivityAfterSavingRelation(data: any) {
    if (data['RELATION_ID']) {
      if (this.isNewMode) {
        this.isNewMode = false;
        this.bypassProtection = true;
        this.router.navigate(['/model/relation/' + data['RELATION_ID']]);
      } else {
        this.readonly = true;
        this.relationMeta = data;
        this.changedRelation = {};
        this._generateRelationForm();
        this.messageService.reportMessage('MODEL', 'RELATION_SAVED', 'S', this.relationMeta.RELATION_ID);
      }
    } else {
      if (data instanceof Array) {
        data.forEach(err => this.messageService.add(err));
      } else {
        this.messageService.report(<Message>data);
      }
    }
  }
}
