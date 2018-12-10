import {Component, Input, OnInit} from '@angular/core';
import {AttributeBase} from '../attribute/attribute-base';
import {FormGroup} from '@angular/forms';
import {AttributeControlService} from '../attribute/attribute-control.service';
import {Attribute} from '../../entity';

@Component({
  selector: 'dk-entity-attribute',
  templateUrl: './entity-attribute.component.html',
  styleUrls: ['./entity-attribute.component.css']
})
export class EntityAttributeComponent implements OnInit {
  @Input() formGroup: FormGroup;
  @Input() entityAttributes: Attribute[];
  @Input() readonly: boolean;

  attributeControls: AttributeBase<any>[];

  constructor(private attributeControlService: AttributeControlService) { }

  ngOnInit() {
    this.attributeControls = this.attributeControlService.toAttributeControl(this.entityAttributes);
  }

}
