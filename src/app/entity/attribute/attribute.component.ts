import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {AttributeBase} from './attribute-base';
import {FormGroup} from '@angular/forms';
import {EntityService} from 'jor-angular';

@Component({
  selector: 'app-attribute',
  templateUrl: './attribute.component.html',
  styleUrls: ['./attribute.component.css']
})
export class AttributeComponent implements OnInit, OnChanges {
  @Input() attributeControl: AttributeBase;
  @Input() formGroup: FormGroup;
  @Input() readonly: boolean;

  constructor(private entityService: EntityService) { }

  ngOnInit() {
  }

  get isValid() { return this.formGroup.controls[this.attributeControl.name].valid; }
  get errorMessage() {
    const fieldCtrl = this.formGroup.get(this.attributeControl.name);
    if (fieldCtrl.getError('pattern')) {
      return 'The pattern is not correct!';
    } else {
      return null;
    }
  }
  get isReadonly() { return this.readonly || this.attributeControl.autoIncrement; }

  onKeyup(attributeName: string) {
    const fieldCtrl = this.formGroup.get(attributeName);
    fieldCtrl.setValue(fieldCtrl.value.toUpperCase());
  }

  onClickDropdown(domainID: string) {
    this.entityService.getDataDomain(domainID)
      .subscribe( dataDomain =>
        dataDomain['DOMAIN_VALUES'].forEach( domainValue => {
          this.attributeControl.dropdownList.push({
            key: domainValue['LOW_VALUE'],
            value: domainValue['LOW_VALUE_TEXT'] || domainValue['LOW_VALUE'] });
        })
      );
  }
}
