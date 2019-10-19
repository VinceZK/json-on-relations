import {Component, Input, OnInit} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {Attribute, AttributeBase, AttributeControlService} from 'jor-angular';

@Component({
  selector: 'app-entity-attribute',
  templateUrl: './entity-attribute.component.html',
  styleUrls: ['./entity-attribute.component.css']
})
export class EntityAttributeComponent implements OnInit {
  attributeControls: AttributeBase[];

  constructor(private attributeControlService: AttributeControlService) { }
  @Input() formGroup: FormGroup;
  @Input() entityAttributes: Attribute[];
  @Input() readonly: boolean;
  ngOnInit() {
    this.attributeControls = this.attributeControlService.toAttributeControl(this.entityAttributes);
  }

}
