import {Component, Input, OnInit} from '@angular/core';
import {Relationship, RelationshipInstance, RelationshipMeta} from '../../entity';
import {MessageService} from 'ui-message/dist/message';
import {msgStore} from '../../msgStore';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-entity-relationship',
  templateUrl: './entity-relationship.component.html',
  styleUrls: ['./entity-relationship.component.css']
})
export class EntityRelationshipComponent implements OnInit {
  isModalShown = false;
  currentTime: string;
  toBeAddedValue: RelationshipInstance;

  private static _getFormattedDate(offset?: number): string {
    const d = offset ? new Date(new Date().getTime() + offset ) : new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-'
      + ('0' + d.getDate()).slice(-2) + ' ' + ('0' + d.getHours()).slice(-2) +
      ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
  }

  constructor(private messageService: MessageService) {
    this.messageService.setMessageStore(msgStore, 'EN');
  }

  @Input() relationship: Relationship;
  @Input() relationshipMeta: RelationshipMeta;
  @Input() formGroup: FormGroup;
  @Input() readonly: boolean;
  ngOnInit() {
    this.currentTime = EntityRelationshipComponent._getFormattedDate();
    this.toBeAddedValue = new RelationshipInstance();
  }

  get displayModal() {return this.isModalShown ? 'block' : 'none'; }

  showAddModal(): void {
    this.isModalShown = true;
    this.toBeAddedValue = new RelationshipInstance();
    this.toBeAddedValue.action = 'add';
    this.toBeAddedValue.VALID_FROM = EntityRelationshipComponent._getFormattedDate();
    this.toBeAddedValue.VALID_TO = EntityRelationshipComponent._getFormattedDate(this.relationshipMeta.VALID_PERIOD);
  }

  addRelationshipInstance(): void {
    if (!this.toBeAddedValue.INSTANCE_GUID) {
      this.messageService.reportMessage('RELATIONSHIP', 'TARGET_INSTANCE_EMPTY', 'E');
      return;
    }

    if (this.toBeAddedValue.VALID_FROM === '') {
      this.messageService.reportMessage('RELATIONSHIP', 'VALID_FROM_EMPTY', 'E');
      return;
    }

    if (this.toBeAddedValue.VALID_TO === '') {
      this.messageService.reportMessage('RELATIONSHIP', 'VALID_TO_EMPTY', 'E');
      return;
    }

    if (this.toBeAddedValue.VALID_FROM >= this.toBeAddedValue.VALID_TO) {
      this.messageService.reportMessage('RELATIONSHIP', 'VALID_FROM_AFTER_VALID_TO', 'E');
      return;
    }

    const index = this.relationship.values.findIndex(value => {
      return value.INSTANCE_GUID === this.toBeAddedValue.INSTANCE_GUID;
    });
    if (index !== -1) {
      this.messageService.reportMessage('RELATIONSHIP', 'INSTANCE_ALREADY_EXIST', 'E');
      return;
    }

    const partnerRoleMeta =
      this.relationshipMeta.INVOLVES.find(involve => involve.ROLE_ID === this.relationship.PARTNER_ROLE_ID);
    if (partnerRoleMeta.CARDINALITY = '[1..1]') {

    }

    this.relationship.values.push(this.toBeAddedValue);
    this.formGroup.markAsDirty();
    this.isModalShown = false;
  }

  expireRelationship(index: number): void {
    this.relationship.values[index].action = 'update';
    this.relationship.values[index].VALID_TO_BAK = this.relationship.values[index].VALID_TO;
    this.relationship.values[index].VALID_TO = this.currentTime;
    this.formGroup.markAsDirty();
  }

  restoreRelationship(index: number): void {
    delete this.relationship.values[index].action;
    this.relationship.values[index].VALID_TO = this.relationship.values[index].VALID_TO_BAK;
  }

  deleteRelationship(index: number): void {
    this.relationship.values.splice(index, 1);
  }

  closeAddModal(): void {
    this.isModalShown = false;
  }
}
