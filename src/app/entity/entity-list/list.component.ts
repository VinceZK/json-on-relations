import {Component, OnInit} from '@angular/core';
import * as Handsontable from 'handsontable';
import {EntityService} from 'jor-angular';
import {Observable} from 'rxjs';
import {Attribute, QueryObject, RelationMeta, Selection} from 'jor-angular';
import {HotTableRegisterer} from '@handsontable/angular';
import {Router} from '@angular/router';
import {MessageService} from 'ui-message-angular';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  instance = 'hot';
  data: any[];
  columns = [];
  colHeaders = [];
  entityIDs$: Observable<any>;
  relationMetas: RelationMeta[];
  attributes: Attribute[];
  queryObject: QueryObject;
  entityID: string;
  relationID: string;
  operators = [
    {ID: 'EQ', LABEL: '='},
    {ID: 'NE', LABEL: '!='},
    {ID: 'GT', LABEL: '>'},
    {ID: 'GE', LABEL: '>='},
    {ID: 'LT', LABEL: '<'},
    {ID: 'LE', LABEL: '<='},
    {ID: 'BT', LABEL: 'between'},
    {ID: 'CN', LABEL: 'contains'},
  ];
  selections: Selection[] = [];
  settingsObj: Handsontable.default.GridSettings;
  entityIDPattern: RegExp;

  constructor(private entityService: EntityService,
              private messageService: MessageService,
              private router: Router,
              private hotRegisterer: HotTableRegisterer) { }

  ngOnInit() {
    this.entityIDs$ = this.entityService.listEntityID();
    this.entityID = 'person';
    this.getRelationIDs();
    this.queryObject = new QueryObject();
    this.entityIDPattern = new RegExp(/<a href="javascript:void\(0\)" role="button">([A-F 0-9]{32})<\/a>/);

    this.settingsObj = {
      stretchH: 'all',
      startRows: 0,
      readOnly: true,
      autoWrapRow: true,
      autoColumnSize: {syncLimit: 100},
      maxRows: 50,
      manualRowResize: true,
      manualColumnResize: true,
      rowHeaders: true,
      afterOnCellMouseDown: (TD, coords) => {
        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        // @ts-ignore
        const regResult = this.entityIDPattern.exec(hotInstance.getDataAtCell( coords.row, coords.col));
        if ( regResult ) { this.router.navigate(['/entity', regResult[1]]); }
      },
      licenseKey: 'non-commercial-and-evaluation'
    };
  }

  getRelationIDs() {
    this.entityService.getRelationMetaOfEntity(this.entityID).
    subscribe(relationMetas => {
      this.relationMetas = [];
      relationMetas.forEach( relationMeta => {
        if (relationMeta.RELATION_ID.substr(0, 2) !== 'rs') {
          this.relationMetas.push(relationMeta);
        }
      });
      this.relationID = this.relationMetas[0].RELATION_ID;
      this.getAttributes();
    });
  }

  getAttributes() {
    this.attributes = this.relationMetas.find(relationMeta => relationMeta.RELATION_ID === this.relationID).ATTRIBUTES;
    this.selections = [];
    if (this.attributes.length > 0) {
      this.selections.push({ FIELD_NAME : this.attributes[0].ATTR_NAME, OPERATOR: 'EQ', LOW: '', HIGH: ''});
    }
  }

  addSelection() {
    this.selections.push({ FIELD_NAME : this.attributes[0].ATTR_NAME, OPERATOR: 'EQ', LOW: '', HIGH: ''});
  }

  deleteSelection(index: number) {
    if (this.selections.length > 1) {
      this.selections.splice(index, 1);
    } else {
     // Message
    }
  }

  newEntity(): void {
    this.router.navigate(['/entity/new', {entityID: this.entityID, action: 'new'}]);
  }

  search() {
    this.messageService.clearMessages();
    this.queryObject.ENTITY_ID = this.entityID;
    this.queryObject.RELATION_ID = this.relationID;
    this.queryObject.PROJECTION = [];
    this.columns = [{data: 'INSTANCE_GUID', renderer: 'html'}];
    this.colHeaders = ['ENTITY_UUID'];
    this.attributes.forEach(attribute => {
      this.queryObject.PROJECTION.push(attribute.ATTR_NAME);
      this.columns.push(this._attributeColumnDisplay(attribute));
      this.colHeaders.push(attribute.ATTR_NAME);
    });
    this.queryObject.FILTER = this.selections;
    this.entityService.searchEntities(this.queryObject).subscribe(data => {
      this.data = data;
      if (this.data[0] && this.data[0]['INSTANCE_GUID']) {
        this.data.forEach(line =>
          line.INSTANCE_GUID = `<a href="javascript:void(0)" role="button">${line.INSTANCE_GUID}</a>`);
      } else {
        this.data.forEach(err => this.messageService.add(err));
        this.data = [];
      }
    });
  }

  _attributeColumnDisplay(attribute: Attribute): any {
    const columnDisplay = {data: attribute.ATTR_NAME};
    switch (attribute.DATA_TYPE) {
      case 1: // Char
        columnDisplay['type'] = 'text';
        // columnDisplay['width'] = attribute.DATA_LENGTH * 10;
        break;
      case 2: // Int4
      case 3: // Double
        columnDisplay['type'] =  'numeric';
        break;
      case 4: // FLOAT
        columnDisplay['type'] =  'numeric';
        columnDisplay['numericFormat'] = {};
        columnDisplay['numericFormat']['pattern'] = '0.00';
        break;
      case 5: // String
        columnDisplay['type'] = 'text';
        break;
      case 6: // XString
        columnDisplay['type'] = 'text';
        break;
      case 7: // Bin
        columnDisplay['type'] = 'text';
        break;
      case 8: // Date
        columnDisplay['type'] = 'date';
        columnDisplay['dateFormat'] = 'YYYY/MM/DD';
        break;
      case 9: // Timestamp
        columnDisplay['type'] = 'date';
        columnDisplay['dateFormat'] = 'YYYY/MM/DD hh:mm:ss';
        break;
      case 10: // Boolean
        columnDisplay['type'] =  'numeric';
        break;
      case 11: // Multi-value
        columnDisplay['type'] =  'text';
        break;
      default:
        columnDisplay['type'] =  'text';
    }

    return columnDisplay;
  }

}
