import {Component, Input, OnInit} from '@angular/core';
import {AttributeBase} from '../../attribute/attribute-base';
import {AbstractControl, FormArray, FormGroup} from '@angular/forms';
import {Attribute, EntityRelation} from '../../entity';
import {AttributeControlService} from '../../attribute/attribute-control.service';

@Component({
  selector: 'app-entity-relation',
  templateUrl: './entity-relation.component.html',
  styleUrls: ['./entity-relation.component.css']
})
export class EntityRelationComponent implements OnInit {
  attributeControls: AttributeBase<any>[];

  constructor(private attributeControlService: AttributeControlService) {}

  @Input() relationAttributes: Attribute[];
  @Input() entityRelation: EntityRelation;
  @Input() formGroup: any;
  @Input() parentFormGroup: FormGroup;
  @Input() readonly: boolean;
  ngOnInit() {
    this.attributeControls = this.attributeControlService.toAttributeControl(this.relationAttributes);
  }

  addNewRelationInstance(): void {
    this.entityRelation.EMPTY = false;
    switch (this.entityRelation.CARDINALITY ) {
      case '[1..1]':
        break;
      case '[0..1]':
        this.parentFormGroup.setControl(this.entityRelation.RELATION_ID,
          this.attributeControlService.convertToFormGroup(this.relationAttributes, {}));
        break;
      case '[0..n]':
      case '[1..n]':
        const formArray = <FormArray>this.formGroup;
        formArray.push(this.attributeControlService.convertToFormGroup(this.relationAttributes, {}));
    }
  }

  deleteRelationInstance(): void {
    this.parentFormGroup.setControl(this.entityRelation.RELATION_ID, new FormGroup({}));
    this.entityRelation.EMPTY = true;
  }
}
