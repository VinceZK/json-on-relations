import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormGroup} from '@angular/forms';
import {Attribute, EntityRelation, AttributeBase, AttributeControlService} from 'jor-angular';

@Component({
  selector: 'app-entity-relation',
  templateUrl: './entity-relation.component.html',
  styleUrls: ['./entity-relation.component.css']
})
export class EntityRelationComponent implements OnInit {
  attributeControls: AttributeBase[];
  relationAttributes: Attribute[];

  constructor(private attributeControlService: AttributeControlService) {}

  @Input() entityRelation: EntityRelation;
  @Input() entityRelations: EntityRelation[];
  @Input() formGroup: AbstractControl;
  @Input() parentFormGroup: FormGroup;
  @Input() readonly: boolean;

  get isEntityRelation(): boolean {
    return this.entityRelation.RELATION_ID.substr(0, 2) !== 'r_' &&
    this.entityRelation.RELATION_ID.substr(0, 3) !== 'rs_';
  }

  ngOnInit() {
    this.relationAttributes = this.entityRelation.ATTRIBUTES;
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

  refreshRoleStatus(): void {
    if (this.formGroup.pristine) { return; }
    this.entityRelations.forEach(entityRelation => {
      if (entityRelation.CONDITIONAL_ATTR && entityRelation.CONDITIONAL_VALUE) {
        const conditionalValues = entityRelation.CONDITIONAL_VALUE.split(`,`);
        entityRelation.DISABLED = !conditionalValues.includes(this.formGroup.get(entityRelation.CONDITIONAL_ATTR).value);
      }
    });
  }
}
