import {Component, OnInit, ViewChild} from '@angular/core';
import {RelationMeta} from '../../../entity';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
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
  selector: 'dk-relation-detail',
  templateUrl: './relation-detail.component.html',
  styleUrls: ['./relation-detail.component.css']
})
export class RelationDetailComponent implements OnInit {
  relationMeta: RelationMeta;
  readonly = true;
  isNewMode = false;
  relationForm: FormGroup;
  changedRelation = {};

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
          return of(relation);
        } else {
          this.readonly = true;
          this.isNewMode = false;
          return this.entityService.getRelationMeta(params.get('relationID'));
        }
      })
    ).subscribe(data => {
      if ( 'msgName' in data) { // If the return data is a message
        this.messageService.clearMessages();
        this.relationMeta = null;
        this.relationForm = null;
        this.messageService.report(<Message>data);
      } else {
        this.messageService.clearMessages();
        this.relationMeta = data;
        this._generateRelationForm();
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
      this.attrComponent.switchEditDisplay(this.readonly);
    }
  }

  _switch2DisplayMode(): void {
    this.readonly = true;
    this.attrComponent.switchEditDisplay(this.readonly);
  }

  onChangeRelationID(): void {
    this.modelService.updateRelationID(this.relationForm.get('RELATION_ID').value);
  }

  onChangeRelationDesc(): void {
    this.modelService.updateRelationDesc(this.relationForm.get('RELATION_DESC').value);
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.isNewMode || (this.relationForm && this.relationForm.dirty)) {
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

    this.entityService.saveRelation(this.changedRelation)
      .subscribe(data => this._postActivityAfterSavingRelation(data));
  }

  _postActivityAfterSavingRelation(data: any) {
    if (data['RELATION_ID']) {
      if (this.isNewMode) {
        this.isNewMode = false;
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
        this.messageService.report(data);
      }
    }
  }
}
