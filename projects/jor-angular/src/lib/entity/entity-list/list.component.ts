import {Component, OnInit} from '@angular/core';
import * as Handsontable from 'handsontable';
import {EntityService} from '../../entity.service';
import {Observable} from 'rxjs';
import {Attribute, QueryObject, RelationMeta, Selection} from '../../entity';
import {HotTableRegisterer} from '@handsontable/angular';
import {Router} from '@angular/router';

@Component({
  selector: 'dk-list',
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
    {ID: 'BT', LABEL: 'Between'}
  ];
  selections: Selection[] = [];
  settingsObj: Handsontable.GridSettings;
  entityIDPattern: RegExp;

  constructor(private entityService: EntityService,
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
      afterOnCellMouseDown: (TD, event, coords) => {
        const hotInstance = this.hotRegisterer.getInstance(this.instance);
        // @ts-ignore
        const regResult = this.entityIDPattern.exec(hotInstance.getDataAtCell( coords.row, coords.col));
        if ( regResult ) { this.router.navigate(['/entity', regResult[1]]); }
      }
    };
  }

  getRelationIDs() {
    this.entityService.getRelationMetaOfEntity(this.entityID).
    subscribe(relationMetas => {
      this.relationMetas = relationMetas;
      this.relationID = this.relationMetas[0].RELATION_ID;
      this.getAttributes();
    });
  }

  getAttributes() {
    this.attributes = this.relationMetas.find(relationMeta => relationMeta.RELATION_ID === this.relationID).ATTRIBUTES;
    this.selections = [];
    this.selections.push({ fieldName : this.attributes[0].ATTR_NAME, operator: 'EQ', low: '', high: ''});
  }

  addSelection() {
    this.selections.push({ fieldName : this.attributes[0].ATTR_NAME, operator: 'EQ', low: '', high: ''});
  }

  deleteSelection(index: number) {
    if (this.selections.length > 1) {
      this.selections.splice(index, 1);
    } else {
     // Message
    }
  }

  newEntity(): void {
    this.router.navigate(['/entity/new', {entityID: this.entityID}]);
  }

  search() {
    this.queryObject.relation = this.relationID;
    this.queryObject.projection = [];
    this.columns = [{data: 'INSTANCE_GUID', renderer: 'html'}];
    this.colHeaders = ['ENTITY_UUID'];
    this.attributes.forEach(attribute => {
      this.queryObject.projection.push(attribute.ATTR_NAME);
      this.columns.push(this._attributeColumnDisplay(attribute));
      this.colHeaders.push(attribute.ATTR_NAME);
    });
    this.queryObject.filter = this.selections;
    this.entityService.searchEntities(this.queryObject).subscribe(data => {
      this.data = data;
      this.data.forEach(line =>
        line.INSTANCE_GUID = `<a href="javascript:void(0)" role="button">${line.INSTANCE_GUID}</a>`);
    });
  }

  navBack() {
    console.log('navBack is called');
    const hotInstance = this.hotRegisterer.getInstance(this.instance);
    hotInstance.selectCell(2, 2);
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
