import {Component, OnInit} from '@angular/core';
import {RoleMeta} from 'jor-angular';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Message, MessageService} from 'ui-message-angular';
import {ModelService} from '../../model.service';
import {DialogService} from '../../../dialog.service';
import {EntityService} from '../../../entity.service';
import {msgStore} from '../../../msgStore';
import {switchMap} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {UniqueRoleValidator} from '../../model-validators';

@Component({
  selector: 'app-role-detail',
  templateUrl: './role-detail.component.html',
  styleUrls: ['./role-detail.component.css']
})
export class RoleDetailComponent implements OnInit {
  roleMeta: RoleMeta;
  readonly = true;
  isNewMode = false;
  roleForm: FormGroup;
  changedRole = {};
  bypassProtection = false;
  isSearchListShown = true;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,
              private uniqueRoleValidator: UniqueRoleValidator,
              private messageService: MessageService,
              private modelService: ModelService,
              private dialogService: DialogService,
              private entityService: EntityService) {
    this.messageService.setMessageStore(msgStore, 'EN');
  }

  get relationFormArray() {
    return this.roleForm.get('RELATIONS') as FormArray;
  }

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        const roleID = params.get('roleID');
        if (roleID === 'new') {
          const role = new RoleMeta();
          role.ROLE_ID = '';
          role.ROLE_DESC = '';
          role.RELATIONS = [];
          this.isNewMode = true;
          this.readonly = false;
          this.bypassProtection = false;
          return of(role);
        } else {
          this.readonly = true;
          this.isNewMode = false;
          return this.entityService.getRole(roleID);
        }
      })
    ).subscribe(data => {
      if ( 'msgName' in data) {
        this.messageService.clearMessages();
        this.roleMeta = null;
        this.roleForm = null;
        this.messageService.report(<Message>data);
      } else {
        this.messageService.clearMessages();
        this.roleMeta = data;
        this._generateRoleForm();
      }
    });

    this.modelService.isSearchListShown$.subscribe( data => this.isSearchListShown = data);
  }

  showSearchList(): void {
    this.isSearchListShown = true;
    this.modelService.showSearchList();
  }

  _generateRoleForm(): void {
    this.roleForm = this.fb.group({});
    this.roleForm.addControl('ROLE_ID', new FormControl(this.roleMeta.ROLE_ID, {updateOn: 'blur'}));
    if (this.isNewMode) {
      this.roleForm.get('ROLE_ID').setValidators(this._validateRoleID);
      this.roleForm.get('ROLE_ID').setAsyncValidators(this.uniqueRoleValidator.validate.bind(this.uniqueRoleValidator));
    }
    this.roleForm.addControl('ROLE_DESC', new FormControl(this.roleMeta.ROLE_DESC));

    // Compose Involves
    const formArray = [];
    this.roleMeta.RELATIONS.forEach( relation => {
      formArray.push(this.fb.group({
        RELATION_ID: [relation.RELATION_ID],
        RELATION_DESC: [relation.RELATION_DESC],
        CARDINALITY: [{value: relation.CARDINALITY, disabled: this.readonly}]
      }));
    });
    if (this.isNewMode) {
      formArray.push(
        this.fb.group({
          RELATION_ID: [''],
          RELATION_DESC: [''],
          CARDINALITY: ['[0..1]']
        }));
    }
    this.roleForm.addControl('RELATIONS', new FormArray(formArray));
  }

  _validateRoleID(c: FormControl) {
    if (c.value.trim() === '') {
      return {message: 'Role ID is mandatory'};
    }

    if (c.value.toString().toLowerCase() === 'new') {
      return {message: '"NEW/new" is reserved, thus is not allowed to use!'};
    }

    return null;
  }

  switchEditDisplay() {
    if (this.isNewMode) {
      this.dialogService.confirm('Discard the new Role?').subscribe(confirm => {
        if (confirm) {
          this._switch2DisplayMode();
          this.roleMeta = null;
          this.modelService.sendDialogAnswer('OK');
        } else {
          this.modelService.sendDialogAnswer('CANCEL');
        }
      });
      return;
    }

    if (!this.readonly) { // In Change Mode -> Display Mode
      if (this.roleForm.dirty) {
        this.dialogService.confirm('Discard changes?').subscribe(confirm => {
          if (confirm) { // Discard changes and switch to Display Mode
            this._generateRoleForm();
            this.roleForm.reset(this.roleForm.value);
            this._switch2DisplayMode();
          }
        });
      } else { // Switch to display mode
        this._switch2DisplayMode();
      }
    } else { // In Display Mode -> Change Mode
      this.readonly = false;
      this.relationFormArray.controls.forEach(relationFormGroup => {
        relationFormGroup.get('CARDINALITY').enable();
      });
      this.relationFormArray.push(
        this.fb.group({
          RELATION_ID: [''],
          RELATION_DESC: [''],
          CARDINALITY: ['[0..1]']
        })
      );
    }
  }

  _switch2DisplayMode(): void {
    this.readonly = true;
    let lastIndex = this.relationFormArray.length - 1;
    while (lastIndex >= 0 && this.relationFormArray.controls[lastIndex].get('ROLE_ID').value.trim() === '') {
      this.relationFormArray.removeAt(lastIndex);
      lastIndex--;
    }
    this.relationFormArray.controls.forEach(relationFormGroup => {
      relationFormGroup.get('CARDINALITY').disable();
    });
  }

  onChangeRoleID(): void {
    this.modelService.updateRoleID(this.roleForm.get('ROLE_ID').value);
  }

  onChangeRoleDesc(): void {
    this.modelService.updateRoleDesc(this.roleForm.get('ROLE_DESC').value);
  }

  deleteRelation(index: number): void {
    if (index !== this.relationFormArray.length - 1) {
      this.relationFormArray.removeAt(index);
      this.relationFormArray.markAsDirty();
    }
  }

  onChangeRelationID(index: number): void {
    const currentRelationFormGroup = this.relationFormArray.controls[index];
    if (this.relationFormArray.controls.findIndex((relationCtrl, i) =>
      i !== index && relationCtrl.get('RELATION_ID').value === currentRelationFormGroup.get('RELATION_ID').value
    ) !== -1) {
      currentRelationFormGroup.get('RELATION_ID').setErrors({message: 'Duplicate Relations'});
      return;
    }

    if (index === this.relationFormArray.length - 1 && currentRelationFormGroup.value.RELATION_ID.trim() !== '') {
      // Only work for the last New line
      this.relationFormArray.push(
        this.fb.group({
          RELATION_ID: [''],
          RELATION_DESC: [''],
          CARDINALITY: ['[0..1]']
        })
      );
    }

    this.entityService.getRelationDesc(currentRelationFormGroup.value.RELATION_ID).subscribe(data => {
      if (data['msgCat']) {
        currentRelationFormGroup.get('RELATION_ID').setErrors({message: data['msgShortText']});
      } else {
        currentRelationFormGroup.get('RELATION_DESC').setValue(data);
      }
    });
  }

  oldRelation(formGroup: AbstractControl): boolean {
    return this.roleMeta.RELATIONS ?
      this.roleMeta.RELATIONS.findIndex(
        relation => relation.RELATION_ID === formGroup.get('RELATION_ID').value ) !== -1 :
      false;
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.isNewMode || (!this.bypassProtection && this.roleForm && this.roleForm.dirty)) {
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
    if (!this.roleForm.dirty) {
      return this.messageService.reportMessage('MODEL', 'NO_CHANGE', 'S');
    }

    if (!this.roleForm.valid) {
      return this.messageService.reportMessage('MODEL', 'INVALID_DATA', 'E');
    }

    if (this.isNewMode) {
      this.changedRole['action'] = 'add';
      this.changedRole['ROLE_ID'] = this.roleForm.controls['ROLE_ID'].value;
    } else {
      this.changedRole['action'] = 'update';
      this.changedRole['ROLE_ID'] = this.roleMeta.ROLE_ID;
    }
    if (this.roleForm.controls['ROLE_DESC'].dirty) {
      this.changedRole['ROLE_DESC'] = this.roleForm.controls['ROLE_DESC'].value;
    }

    this._processChangedRelation();

    this.entityService.saveRole(this.changedRole)
      .subscribe(data => this._postActivityAfterSavingRole(data));
  }

  _processChangedRelation(): void {
    const changedRelations = [];
    if (!this.relationFormArray.dirty) { return; }

    this.changedRole['RELATIONS'] = changedRelations;

    this.relationFormArray.controls.forEach(relationControl => {
      if (relationControl.get('RELATION_ID').value.trim() === '') { return; }
      let action;
      const index = this.roleMeta.RELATIONS.findIndex(
        relation => relationControl.get('RELATION_ID').value === relation.RELATION_ID);
      if (index === -1) {// New Add Case
        action = 'add';
      } else {
        if (relationControl.dirty) {// Change Case
          action = 'update';
        }
      }
      if (action) {
        changedRelations.push({
          action: action, RELATION_ID: relationControl.get('RELATION_ID').value, CARDINALITY: relationControl.get('CARDINALITY').value
        });
      }
    });

    // Deletion Case
    this.roleMeta.RELATIONS.forEach(relation => {
      const index = this.relationFormArray.controls.findIndex(
        relationControl => relationControl.get('RELATION_ID').value === relation.RELATION_ID);
      if (index === -1) { // The attribute must be deleted
        const deletedRelation = {action: 'delete', RELATION_ID: relation.RELATION_ID};
        changedRelations.push(deletedRelation);
      }
    });
  }

  _postActivityAfterSavingRole(data: any) {
    if (data && data['ROLE_ID']) {
      if (this.isNewMode) {
        this.isNewMode = false;
        this.bypassProtection = true;
        this.router.navigate(['/model/role/' + data['ROLE_ID']]);
      } else {
        this.readonly = true;
        this.roleMeta = data;
        this._generateRoleForm();
        this.changedRole = {};
        this.messageService.reportMessage('MODEL', 'ROLE_SAVED', 'S', this.roleMeta.ROLE_ID);
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
