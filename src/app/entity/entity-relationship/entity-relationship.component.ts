import {Component, Input, OnInit, QueryList, ViewChildren, ViewEncapsulation} from '@angular/core';
import {PartnerInstance, RelationMeta, Relationship, RelationshipInstance, RelationshipMeta} from '../../entity';
import {MessageService} from 'ui-message-angular';
import {msgStore} from '../../msgStore';
import {FormBuilder, FormGroup} from '@angular/forms';
import {NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import {AttributeBase} from '../attribute/attribute-base';
import {AttributeControlService} from '../attribute/attribute-control.service';

@Component({
  selector: 'app-entity-relationship',
  templateUrl: './entity-relationship.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./entity-relationship.component.css']
})
export class EntityRelationshipComponent implements OnInit {
  isModalShown = false;
  currentTime: string;
  detailValue: RelationshipInstance;
  attributeControls: AttributeBase<any>[];
  relationshipFormGroup: FormGroup;
  readonlyValidFrom: boolean;
  readonlyValidTo: boolean;
  readonlyPartner: boolean;
  readonlyAttribute: boolean;
  fakeUUIDs = [];

  constructor(private fb: FormBuilder,
              private messageService: MessageService,
              private attributeControlService: AttributeControlService) {
    this.messageService.setMessageStore(msgStore, 'EN');
    this.relationshipFormGroup = this.fb.group({});
  }

  @Input() relationship: Relationship;
  @Input() relationshipMeta: RelationshipMeta;
  @Input() relationshipAttributeMeta: RelationMeta;
  @Input() formGroup: FormGroup;
  @Input() readonly: boolean;
  @ViewChildren('p') popovers !: QueryList<NgbPopover>;
  private static _getFormattedDate(offset?: number): string {
    const d = offset ? new Date(new Date().getTime() + offset * 1000 ) : new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-'
      + ('0' + d.getDate()).slice(-2) + ' ' + ('0' + d.getHours()).slice(-2) +
      ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
  }

  ngOnInit() {
    this.currentTime = EntityRelationshipComponent._getFormattedDate();
    this.attributeControls = this.attributeControlService.toAttributeControl(this.relationshipAttributeMeta.ATTRIBUTES);
    this.detailValue = new RelationshipInstance();
    this.relationshipAttributeMeta.ATTRIBUTES.forEach(attribute => {
      this.relationshipFormGroup.addControl(attribute.ATTR_NAME,
        this.attributeControlService.convertToFormControl(attribute, this.detailValue));
    }); // Must be initialized, or the form group is null as the modal will be initialized.
  }

  popoverPartnerInstances(event) {
    // @ts-ignore
    this.popovers.forEach(p => p._elementRef.nativeElement.innerText === event.target.innerText ? p.toggle() : p.close());
  }

  get displayModal() {return this.isModalShown ? 'block' : 'none'; }

  showModalAdd(): void {
    this.isModalShown = true;
    this.detailValue = new RelationshipInstance();
    this.detailValue.action = 'add';
    this.detailValue.RELATIONSHIP_INSTANCE_GUID = this._generateFakeUUID();
    this.detailValue.VALID_FROM = 'now';
    this.detailValue.VALID_TO = EntityRelationshipComponent._getFormattedDate(this.relationshipMeta.VALID_PERIOD);
    this.detailValue.PARTNER_INSTANCES = [];
    const involves = this.relationshipMeta.INVOLVES.filter(involve => involve.ROLE_ID !== this.relationship.SELF_ROLE_ID);
    involves.forEach(involve => {
      const partnerInstance = new PartnerInstance();
      partnerInstance.ROLE_ID = involve.ROLE_ID;
      this.detailValue.PARTNER_INSTANCES.push(partnerInstance);
    });
    this.relationshipAttributeMeta.ATTRIBUTES.forEach(attribute => {
      this.relationshipFormGroup.setControl(attribute.ATTR_NAME,
        this.attributeControlService.convertToFormControl(attribute, this.detailValue));
    });
    this.readonlyValidFrom = false;
    this.readonlyValidTo = false;
    this.readonlyPartner = false;
    this.readonlyAttribute = false;
  }

  _generateFakeUUID(): string {
    const nextPosition = this.fakeUUIDs.length + 1;
    const fakeUUID = 'NewRelationship_' + nextPosition;
    this.fakeUUIDs.push(fakeUUID);
    return fakeUUID;
  }

  showModalForDisplay(index: number): void {
    this._getRelationshipDetailValue(index);
    this.readonlyValidFrom = true;
    this.readonlyValidTo = true;
    this.readonlyPartner = true;
    this.readonlyAttribute = true;
  }

  showModalForChange(index: number): void {
    this._getRelationshipDetailValue(index);
    this.detailValue.action = 'update';
    this.readonlyValidFrom = true;
    this.readonlyValidTo = true;
    this.readonlyPartner = true;
    this.readonlyAttribute = false;
  }

  showModalForExtend(index: number): void {
    this._getRelationshipDetailValue(index);
    this.detailValue.action = 'extend';
    this.readonlyValidFrom = true;
    this.readonlyValidTo = false;
    this.readonlyPartner = true;
    this.readonlyAttribute = true;
  }

  confirm(): void {
    switch (this.detailValue.action) {
      case 'add':
        this._addRelationshipInstance();
        break;
      case 'update':
        this._changeRelationship();
        break;
      case 'extend':
        this.formGroup.markAsDirty();
        break;
      default:
    }
    this.isModalShown = false;
  }

  _addRelationshipInstance(): void {
    let hasError = false;
    this.detailValue.PARTNER_INSTANCES.forEach(partnerInstance => {
      if (!partnerInstance.ENTITY_ID) {
        this.messageService.reportMessage('RELATIONSHIP', 'PARTNER_ENTITY_ID_MISSING', 'E');
        return hasError = true;
      }
      if (!partnerInstance.INSTANCE_GUID) {
        this.messageService.reportMessage('RELATIONSHIP', 'PARTNER_INSTANCE_GUID_MISSING', 'E');
        return hasError = true;
      }
    });
    if (hasError) { return; }

    if (this.detailValue.VALID_FROM === '') {
      this.detailValue.VALID_FROM = EntityRelationshipComponent._getFormattedDate();
    }

    if (this.detailValue.VALID_TO === '') {
      this.messageService.reportMessage('RELATIONSHIP', 'VALID_TO_EMPTY', 'E');
      return;
    }

    if (this.detailValue.VALID_FROM !== 'now' && this.detailValue.VALID_FROM >= this.detailValue.VALID_TO) {
      this.messageService.reportMessage('RELATIONSHIP', 'VALID_FROM_AFTER_VALID_TO', 'E');
      return;
    }

    if (!this.relationshipFormGroup.valid) {
      this.messageService.reportMessage('RELATIONSHIP', 'MANDATORY_ATTRIBUTE_MISSING', 'E');
      return;
    }

    this._changedRelationshipAttributes();
    if (!this.relationship.values) {this.relationship.values = []; }
    this.relationship.values.push(this.detailValue);
    this.formGroup.markAsDirty();
  }

  _getRelationshipDetailValue(index: number) {
    this.isModalShown = true;
    this.detailValue = this.relationship.values[index];
    this.relationshipAttributeMeta.ATTRIBUTES.forEach(attribute => {
      this.relationshipFormGroup.setControl(attribute.ATTR_NAME,
        this.attributeControlService.convertToFormControl(attribute, this.detailValue));
    });
  }

  _changeRelationship(): void {
    if (this._changedRelationshipAttributes()) {
      this.formGroup.markAsDirty();
    }
  }

  _changedRelationshipAttributes(): boolean {
    let hasChangedAttribute = false;
    Object.keys(this.relationshipFormGroup.controls).forEach(key => {
      const control = this.relationshipFormGroup.controls[key];
      if (control.dirty) {
        this.detailValue[key] = control.value;
        hasChangedAttribute = true;
      }
    });
    return hasChangedAttribute;
  }

  expireRelationship(index: number): void {
    this.relationship.values[index].action = 'expire';
    this.relationship.values[index].VALID_TO = this.currentTime;
    this.formGroup.markAsDirty();
  }

  deleteRelationship(index: number): void {
    if (this.relationship.values[index].action = 'add') {
      this.relationship.values.splice(index, 1);
    } else {
      this.relationship.values[index].action = 'delete';
      this.formGroup.markAsDirty();
    }
  }

  closeAddModal(): void {
    this.isModalShown = false;
  }

  getValidityStatus(relationshipInstance: RelationshipInstance): string {
    if (relationshipInstance.action === 'add') {
      return 'new';
    }
    if (relationshipInstance.action === 'delete') {
      return 'delete';
    }
    if (relationshipInstance.VALID_TO > this.currentTime && relationshipInstance.VALID_FROM <= this.currentTime) {
      return 'current';
    }
    if (relationshipInstance.VALID_TO <= this.currentTime) {
      return 'expired';
    }
    if (relationshipInstance.VALID_FROM > this.currentTime) {
      return 'future';
    }
  }
}
