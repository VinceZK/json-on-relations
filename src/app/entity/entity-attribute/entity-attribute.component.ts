import {Component, Input, OnInit} from '@angular/core';
import {AttributeBase} from '../../attribute/attribute-base';
import {FormGroup} from '@angular/forms';
import {AttributeControlService} from '../../attribute/attribute-control.service';
import {Attribute} from '../../entity';

@Component({
  selector: 'app-entity-attribute',
  templateUrl: './entity-attribute.component.html',
  styleUrls: ['./entity-attribute.component.css']
})
export class EntityAttributeComponent implements OnInit {
  attributeControls: AttributeBase<any>[];

  constructor(private attributeControlService: AttributeControlService) { }
  @Input() formGroup: FormGroup;
  @Input() entityAttributes: Attribute[];
  @Input() readonly: boolean;
  ngOnInit() {
    this.attributeControls = this.attributeControlService.toAttributeControl(this.entityAttributes);
  }

}
