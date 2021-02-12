import {Component, Input, OnInit, QueryList, ViewChild, ViewChildren, ViewEncapsulation} from '@angular/core';
import {Attribute, RelationMeta, Relationship, RelationshipInstance,
  RelationshipMeta, AttributeBase, AttributeControlService, EntityService, SearchHelpComponent} from 'jor-angular';
import {MessageService} from 'ui-message-angular';
import {msgStore} from '../../msgStore';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {NgbPopover} from '@ng-bootstrap/ng-bootstrap';

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
  attributeControls: AttributeBase[];
  partnerInstanceFA: FormArray;
  relationshipAttributeFG: FormGroup;
  relationshipAttributes: Attribute[] = [];
  readonlyValidFrom: boolean;
  readonlyValidTo: boolean;
  readonlyPartner: boolean;
  readonlyAttribute = false;
  entityIDsByRole = {};

  constructor(private fb: FormBuilder,
              private messageService: MessageService,
              private entityService: EntityService,
              private attributeControlService: AttributeControlService) {
    this.relationshipAttributeFG = this.fb.group({});
  }

  @Input() relationship: Relationship;
  @Input() relationshipMeta: RelationshipMeta;
  @Input() relationshipAttributeMeta: RelationMeta;
  @Input() formGroup: FormGroup;
  @Input() readonly: boolean;
  @ViewChildren('p') popovers !: QueryList<NgbPopover>;
  @ViewChild(SearchHelpComponent, {static: false})
  private searchHelpComponent !: SearchHelpComponent;

  private static _getFormattedDate(offset?: number): string {
    const d = offset ? new Date(new Date().getTime() + offset * 1000 ) : new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-'
      + ('0' + d.getDate()).slice(-2) + ' ' + ('0' + d.getHours()).slice(-2) +
      ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
  }

  ngOnInit() {
    this.currentTime = EntityRelationshipComponent._getFormattedDate();
    this.detailValue = new RelationshipInstance();
    this.relationshipAttributeMeta.ATTRIBUTES.forEach(attribute => {
      if (attribute.ATTR_NAME !== 'VALID_FROM' && attribute.ATTR_NAME !== 'VALID_TO'
          && attribute.ATTR_NAME.substr(-14, 14) !== '_INSTANCE_GUID'
          && attribute.ATTR_NAME.substr(-10, 10) !== '_ENTITY_ID') {
        this.relationshipAttributes.push(attribute);
        this.relationshipAttributeFG.addControl(attribute.ATTR_NAME,
          this.attributeControlService.convertToFormControl(attribute, this.detailValue));
      }
    });
    this.attributeControls = this.attributeControlService.toAttributeControl(this.relationshipAttributes);
  }

  popoverPartnerInstances(event) {
    // @ts-ignore
    this.popovers.forEach(p => p._elementRef.nativeElement.innerText === event.target.innerText ? p.toggle() : p.close());
  }

  get displayModal() {return this.isModalShown ? 'block' : 'none'; }

  showModalAdd(): void {
    this.isModalShown = true;
    this.readonlyValidFrom = false;
    this.readonlyValidTo = false;
    this.readonlyPartner = false;
    this.readonlyAttribute = false;
    this.detailValue = new RelationshipInstance();
    this.detailValue.action = 'add';
    this.detailValue.RELATIONSHIP_INSTANCE_GUID = this.entityService.generateFakeRelationshipUUID();
    if (this.relationshipMeta.VALID_PERIOD > 0) {
      this.detailValue.VALID_FROM = 'now';
      this.detailValue.VALID_TO = EntityRelationshipComponent._getFormattedDate(this.relationshipMeta.VALID_PERIOD);
    }
    const involves = this.relationshipMeta.INVOLVES.filter(involve => involve.ROLE_ID !== this.relationship.SELF_ROLE_ID);
    this.partnerInstanceFA = this.fb.array( involves.map( involve =>
      this.fb.group({
        ROLE_ID: [involve.ROLE_ID],
        ENTITY_ID: [{value: '', disabled: this.readonlyPartner}],
        INSTANCE_GUID: ['']}) ));
    involves.forEach( involve => {
      if (!this.entityIDsByRole[involve.ROLE_ID]) {
        this.entityIDsByRole[involve.ROLE_ID] = this.entityService.listEntityIDbyRole(involve.ROLE_ID); }
    });
    // this.relationshipAttributes.forEach(attribute =>
    //   this.relationshipAttributeFG.get(attribute.ATTR_NAME).setValue(this.detailValue[attribute.ATTR_NAME]));
  }

  onSearchHelp(entityID: string, exportObject: object): void {
    this.searchHelpComponent.openSearchHelpModalByEntity(entityID, entityID, exportObject, this.readonlyPartner);
  }

  showModalForDisplay(index: number): void {
    this.readonlyValidFrom = true;
    this.readonlyValidTo = true;
    this.readonlyPartner = true;
    this.readonlyAttribute = true;
    this._getRelationshipDetailValue(index);
  }

  showModalForChange(index: number): void {
    this.detailValue.action = 'update';
    this.readonlyValidFrom = true;
    this.readonlyValidTo = true;
    this.readonlyPartner = true;
    this.readonlyAttribute = false;
    this._getRelationshipDetailValue(index);
  }

  showModalForExtend(index: number): void {
    this.detailValue.action = 'extend';
    this.readonlyValidFrom = true;
    this.readonlyValidTo = false;
    this.readonlyPartner = true;
    this.readonlyAttribute = true;
    this._getRelationshipDetailValue(index);
  }

  _getRelationshipDetailValue(index: number) {
    this.isModalShown = true;
    this.detailValue = this.relationship.values[index];
    this.detailValue.PARTNER_INSTANCES.forEach(
      partnerInstance => {
        if (!this.entityIDsByRole[partnerInstance.ROLE_ID]) {
          this.entityIDsByRole[partnerInstance.ROLE_ID] = this.entityService.listEntityIDbyRole(partnerInstance.ROLE_ID);
        }
      });
    this.partnerInstanceFA = this.fb.array( this.detailValue.PARTNER_INSTANCES.map( partnerInstance =>
      this.fb.group({
        ROLE_ID: [partnerInstance.ROLE_ID],
        ENTITY_ID: [{value: partnerInstance.ENTITY_ID, disabled: this.readonlyPartner}],
        INSTANCE_GUID: [partnerInstance.INSTANCE_GUID]
      })) );
    this.relationshipAttributes.forEach(attribute =>
      this.relationshipAttributeFG.get(attribute.ATTR_NAME).setValue(this.detailValue[attribute.ATTR_NAME]));
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
    this.detailValue.PARTNER_INSTANCES = this.partnerInstanceFA.getRawValue();
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

    if (!this.relationshipAttributeFG.valid) {
      this.messageService.reportMessage('RELATIONSHIP', 'MANDATORY_ATTRIBUTE_MISSING', 'E');
      return;
    }

    this._changedRelationshipAttributes();
    if (!this.relationship.values) {this.relationship.values = []; }
    this.relationship.values.push(this.detailValue);
    this.formGroup.markAsDirty();
  }

  _changeRelationship(): void {
    if (this._changedRelationshipAttributes()) {
      this.formGroup.markAsDirty();
    }
  }

  _changedRelationshipAttributes(): boolean {
    let hasChangedAttribute = false;
    Object.keys(this.relationshipAttributeFG.controls).forEach(key => {
      const control = this.relationshipAttributeFG.controls[key];
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
    if (this.relationship.values[index].action === 'add') {
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
