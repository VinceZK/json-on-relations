import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormGroup} from '@angular/forms';
import {AttributeBase} from '../attribute-base';
import {EntityRelation} from 'jor-angular';

@Component({
  selector: 'app-attribute-table',
  templateUrl: './attribute-table.component.html',
  styleUrls: ['./attribute-table.component.css']
})
export class AttributeTableComponent implements OnInit {
  isDetailModalShown = false;
  currentFormGroup: AbstractControl;
  isErrorModalShown = false;
  errorTitle: string;
  errorDescription: string;

  constructor() {}

  @Input() attributeControls: AttributeBase<any>[];
  @Input() formArray: FormArray;
  @Input() parentFormGroup: FormGroup;
  @Input() entityRelation: EntityRelation;
  @Input() readonly: boolean;
  ngOnInit() {
  }

  get displayDetailModal() {return this.isDetailModalShown ? 'block' : 'none'; }
  get displayErrorModal() {return this.isErrorModalShown ? 'block' : 'none'; }

  openDetailModal(index: number): void {
    this.currentFormGroup = this.formArray.controls[index];
    this.isDetailModalShown = true;
  }

  closeDetailModal(): void {
    this.currentFormGroup.setValue(this.currentFormGroup.value); // Or the value won't be updated.
    this.isDetailModalShown = false;
  }

  openErrorModal(errorTitle: string, errorDescription: string): void {
    this.errorTitle = errorTitle;
    this.errorDescription = errorDescription;
    this.isErrorModalShown = true;
  }

  closeErrorModal(): void {
    this.isErrorModalShown = false;
  }

  deleteRelationInstance(index: number = 0): void {
    switch (this.entityRelation.CARDINALITY ) {
      case '[0..n]':
        this.formArray.removeAt(index);
        this.formArray.markAsDirty();
        if (this.formArray.length === 0) {
          this.entityRelation.EMPTY = true;
        }
        break;
      case '[1..n]':
        if (this.formArray.length === 1) {
          this.openErrorModal('Deletion Fail', 'The relation requires at lease one entry!');
        } else {
          this.formArray.removeAt(index);
          this.formArray.markAsDirty();
        }
    }
  }
}
