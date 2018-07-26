import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormGroup} from '@angular/forms';
import {AttributeBase} from '../attribute-base';
import {st} from '@angular/core/src/render3';
import {EntityRelation} from '../../entity';

@Component({
  selector: 'app-attribute-table',
  templateUrl: './attribute-table.component.html',
  styleUrls: ['./attribute-table.component.css']
})
export class AttributeTableComponent implements OnInit {

  constructor() { }

  @Input() attributeControls: AttributeBase<any>[];
  @Input() formArray: FormArray;
  @Input() parentFormGroup: FormGroup;
  @Input() entityRelation: EntityRelation;
  @Input() readonly: boolean;
  ngOnInit() {
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
          // Popup an error dialog
        } else {
          this.formArray.removeAt(index);
          this.formArray.markAsDirty();
        }
    }
  }
}
