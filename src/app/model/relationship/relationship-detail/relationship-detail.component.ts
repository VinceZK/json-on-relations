import {Component, OnInit, ViewChild} from '@angular/core';
import {Attribute, RelationshipMeta} from '../../../entity';
import {FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {AttributeMetaComponent} from '../../attribute-meta/attribute-meta.component';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Message, MessageService} from 'ui-message-angular';
import {ModelService} from '../../model.service';
import {DialogService} from '../../../dialog.service';
import {EntityService} from '../../../entity.service';
import {msgStore} from '../../../msgStore';
import {switchMap} from 'rxjs/operators';
import {forkJoin, Observable, of} from 'rxjs';
import {UniqueRelationshipValidator} from '../../model-validators';

@Component({
  selector: 'app-relationship-detail',
  templateUrl: './relationship-detail.component.html',
  styleUrls: ['./relationship-detail.component.css']
})
export class RelationshipDetailComponent implements OnInit {
  relationshipMeta: RelationshipMeta;
  attributes: Attribute[];
  readonly = true;
  isNewMode = false;
  relationshipForm: FormGroup;
  changedRelationship = {};
  bypassProtection = false;

  @ViewChild(AttributeMetaComponent)
  private attrComponent: AttributeMetaComponent;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,
              private uniqueRelationshipValidator: UniqueRelationshipValidator,
              private messageService: MessageService,
              private modelService: ModelService,
              private dialogService: DialogService,
              private entityService: EntityService) {
    this.messageService.setMessageStore(msgStore, 'EN');
  }

  get involveFormArray() {
    return this.relationshipForm.get('INVOLVES') as FormArray;
  }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const relationshipID = params.get('relationshipID');
        if (relationshipID === 'new') {
          const relationship = new RelationshipMeta();
          relationship.RELATIONSHIP_ID = 'rs_';
          relationship.RELATIONSHIP_DESC = '';
          relationship.VALID_PERIOD = 36000000;
          relationship.INVOLVES = [];
          this.isNewMode = true;
          this.readonly = false;
          this.bypassProtection = false;
          return forkJoin(of(relationship), of([]));
        } else {
          this.readonly = true;
          this.isNewMode = false;
          return forkJoin(
            this.entityService.getRelationship(relationshipID),
            this.entityService.getRelationMeta(relationshipID));
        }
      })
    ).subscribe(data => {
      if ( 'msgName' in data[0]) {
        this.messageService.clearMessages();
        this.relationshipMeta = null;
        this.relationshipForm = null;
        this.messageService.report(<Message>data[0]);
      } else {
        this.messageService.clearMessages();
        this.relationshipMeta = data[0];
        this.attributes = 'msgName' in data[1] ? [] : data[1]['ATTRIBUTES'];
        this._generateRelationshipForm();
      }
    });
  }

  _generateRelationshipForm(): void {
    this.relationshipForm = this.fb.group({});
    this.relationshipForm.addControl(
      'RELATIONSHIP_ID', new FormControl(this.relationshipMeta.RELATIONSHIP_ID, {updateOn: 'blur'}));
    if (this.isNewMode) {
      this.relationshipForm.get('RELATIONSHIP_ID').setValidators(this._validateRelationshipID);
      this.relationshipForm.get('RELATIONSHIP_ID').setAsyncValidators(
        this.uniqueRelationshipValidator.validate.bind(this.uniqueRelationshipValidator));
    }
    this.relationshipForm.addControl('RELATIONSHIP_DESC', new FormControl(this.relationshipMeta.RELATIONSHIP_DESC));
    this.relationshipForm.addControl('VALID_PERIOD', new FormControl(this.relationshipMeta.VALID_PERIOD));
    // Compose Involves
    const formArray = [];
    this.relationshipMeta.INVOLVES.forEach( involve => {
      formArray.push(this.fb.group({
        ROLE_ID: [involve.ROLE_ID],
        ROLE_DESC: [involve.ROLE_DESC],
        CARDINALITY: [{value: involve.CARDINALITY, disabled: this.readonly}],
        DIRECTION: [involve.DIRECTION]
      }));
    });
    if (this.isNewMode) {
      formArray.push(
        this.fb.group({
          ROLE_ID: [''],
          ROLE_DESC: [''],
          CARDINALITY: ['[1..1]'],
          DIRECTION: ['']
        }));
    }
    this.relationshipForm.addControl('INVOLVES', new FormArray(formArray));
  }

  _validateRelationshipID(c: FormControl) {
    if (c.value.trim() === '') {
      return {message: 'Relationship ID is mandatory'};
    }

    if (c.value.toString().toLowerCase() === 'new') {
      return {message: '"NEW/new" is reserved, thus is not allowed to use!'};
    }

    if (c.value.toString().toLowerCase().substr(0, 3) !== 'rs_') {
      return {message: 'Relationship ID must be started with "rs_"!'};
    }

    if (c.value.toString().length < 4) {
      return {message: 'Relationship ID must have length larger than 3!'};
    }
    return null;
  }

  switchEditDisplay() {
    if (this.isNewMode) {
      this.dialogService.confirm('Discard the new Relationship?').subscribe(confirm => {
        if (confirm) {
          this._switch2DisplayMode();
          this.relationshipMeta = null;
          this.modelService.sendDialogAnswer('OK');
        } else {
          this.modelService.sendDialogAnswer('CANCEL');
        }
      });
      return;
    }

    if (!this.readonly) { // In Change Mode -> Display Mode
      if (this.relationshipForm.dirty) {
        this.dialogService.confirm('Discard changes?').subscribe(confirm => {
          if (confirm) { // Discard changes and switch to Display Mode
            this._generateRelationshipForm();
            this.relationshipForm.reset(this.relationshipForm.value);
            this._switch2DisplayMode();
          }
        });
      } else { // Switch to display mode
        this._switch2DisplayMode();
      }
    } else { // In Display Mode -> Change Mode
      this.readonly = false;
      this.attrComponent.switchEditDisplay(this.readonly);
      this.involveFormArray.controls.forEach(involveFormGroup => {
        involveFormGroup.get('CARDINALITY').enable();
      });
      this.involveFormArray.push(
        this.fb.group({
          ROLE_ID: [''],
          ROLE_DESC: [''],
          CARDINALITY: ['[1..1]'],
          DIRECTION: ['']
        })
      );
    }
  }

  _switch2DisplayMode(): void {
    this.readonly = true;
    this.attrComponent.switchEditDisplay(this.readonly);
    let lastIndex = this.involveFormArray.length - 1;
    while (lastIndex >= 0 && this.involveFormArray.controls[lastIndex].get('ROLE_ID').value.trim() === '') {
      this.involveFormArray.removeAt(lastIndex);
      lastIndex--;
    }
    this.involveFormArray.controls.forEach(involveFormGroup => {
      involveFormGroup.get('CARDINALITY').disable();
    });
  }

  onChangeRelationshipID(): void {
    this.modelService.updateRelationshipID(this.relationshipForm.get('RELATIONSHIP_ID').value);
  }

  onChangeRelationshipDesc(): void {
    this.modelService.updateRelationshipDesc(this.relationshipForm.get('RELATIONSHIP_DESC').value);
  }

  deleteInvolve(index: number): void {
    if (index !== this.involveFormArray.length - 1) {
      this.involveFormArray.removeAt(index);
      this.involveFormArray.markAsDirty();
    }
  }

  onChangeRoleID(index: number): void {
    const currentInvolveFormGroup = this.involveFormArray.controls[index];
    if (this.involveFormArray.controls.findIndex((involveCtrl, i) =>
      i !== index && involveCtrl.get('ROLE_ID').value === currentInvolveFormGroup.get('ROLE_ID').value
    ) !== -1) {
      currentInvolveFormGroup.get('ROLE_ID').setErrors({message: 'Duplicate roles'});
      return;
    }

    if (index === this.involveFormArray.length - 1 && currentInvolveFormGroup.value.ROLE_ID.trim() !== '') {
      // Only work for the last New line
      this.involveFormArray.push(
        this.fb.group({
          ROLE_ID: [''],
          ROLE_DESC: [''],
          CARDINALITY: ['[1..1]'],
          DIRECTION: ['']
        })
      );
    }

    this.entityService.getRoleDesc(currentInvolveFormGroup.value.ROLE_ID).subscribe(data => {
      if (data['msgCat']) {
        currentInvolveFormGroup.get('ROLE_ID').setErrors({message: data['msgShortText']});
      } else {
        currentInvolveFormGroup.get('ROLE_DESC').setValue(data);
      }
    });
  }

  oldInvolve(formGroup: FormGroup): boolean {
    return this.relationshipMeta.INVOLVES.findIndex( role => role.ROLE_ID === formGroup.get('ROLE_ID').value ) !== -1;
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.isNewMode || (!this.bypassProtection && this.relationshipForm && this.relationshipForm.dirty)) {
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
    if (!this.relationshipForm.dirty) {
      return this.messageService.reportMessage('MODEL', 'NO_CHANGE', 'S');
    }

    if (!this.relationshipForm.valid) {
      return this.messageService.reportMessage('MODEL', 'INVALID_DATA', 'E');
    }

    if (this.isNewMode) {
      this.changedRelationship['action'] = 'add';
      this.changedRelationship['RELATIONSHIP_ID'] = this.relationshipForm.controls['RELATIONSHIP_ID'].value;
    } else {
      this.changedRelationship['action'] = 'update';
      this.changedRelationship['RELATIONSHIP_ID'] = this.relationshipMeta.RELATIONSHIP_ID;
    }
    if (this.relationshipForm.controls['RELATIONSHIP_DESC'].dirty) {
      this.changedRelationship['RELATIONSHIP_DESC'] = this.relationshipForm.controls['RELATIONSHIP_DESC'].value;
    }
    if (this.isNewMode || this.relationshipForm.controls['VALID_PERIOD'].dirty) {
      this.changedRelationship['VALID_PERIOD'] = this.relationshipForm.controls['VALID_PERIOD'].value;
    }

    this.changedRelationship['ATTRIBUTES'] = this.attrComponent.processChangedAttributes();
    this._processChangedInvolves();

    this.entityService.saveRelationship(this.changedRelationship)
      .subscribe(data => this._postActivityAfterSavingRelationship(data));
  }

  _processChangedInvolves(): void {
    const changedInvolves = [];
    if (this.involveFormArray.dirty) {
      this.changedRelationship['INVOLVES'] = changedInvolves;

      this.involveFormArray.controls.forEach(involveControl => {
        if (involveControl.get('ROLE_ID').value.trim() === '') { return; }
        let action;
        const index = this.relationshipMeta.INVOLVES.findIndex(
          involve => involveControl.get('ROLE_ID').value === involve.ROLE_ID);
        if (index === -1) { // New Add Case
          action = 'add';
        } else { // New Update Case
          if (involveControl.dirty) { action = 'update'; }
        }
        if (action) {
          changedInvolves.push({ action: action, ROLE_ID: involveControl.get('ROLE_ID').value,
            CARDINALITY: involveControl.get('CARDINALITY').value, DIRECTION: involveControl.get('DIRECTION').value });
        }
      });

      // Deletion Case
      this.relationshipMeta.INVOLVES.forEach(involve => {
        const index = this.involveFormArray.controls.findIndex(
          roleControl => roleControl.get('ROLE_ID').value === involve.ROLE_ID);
        if (index === -1) { // The attribute must be deleted
          const deletedRole = {action: 'delete', ROLE_ID: involve.ROLE_ID};
          changedInvolves.push(deletedRole);
        }
      });
    }
  }

  _postActivityAfterSavingRelationship(data: any) {
    if (data[0] && data[0]['RELATIONSHIP_ID']) {
      if (this.isNewMode) {
        this.isNewMode = false;
        this.bypassProtection = true;
        this.router.navigate(['/model/relationship/' + data[0]['RELATIONSHIP_ID']]);
      } else {
        this.readonly = true;
        this.relationshipMeta = data[0];
        this.attributes = data[1].ATTRIBUTES;
        this.changedRelationship = {};
        this._generateRelationshipForm();
        this.messageService.reportMessage('MODEL', 'RELATIONSHIP_SAVED', 'S', this.relationshipMeta.RELATIONSHIP_ID);
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
