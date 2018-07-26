import {Component, Input, OnInit} from '@angular/core';
import {Relationship} from '../../entity';

@Component({
  selector: 'app-entity-relationship',
  templateUrl: './entity-relationship.component.html',
  styleUrls: ['./entity-relationship.component.css']
})
export class EntityRelationshipComponent implements OnInit {

  constructor() { }

  @Input() relationship: Relationship;
  @Input() readonly: boolean;
  ngOnInit() {
  }

}
