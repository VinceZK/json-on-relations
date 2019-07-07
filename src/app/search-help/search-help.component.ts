import {Component, Input, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {SearchHelp, SearchHelpMethod} from './search-help.type';
import {QueryObject, RelationMeta} from '../../../projects/jor-angular/src/lib/entity';
import {EntityService} from '../entity.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-search-help',
  templateUrl: './search-help.component.html',
  styleUrls: ['./search-help.component.css']
})
export class SearchHelpComponent implements OnInit {
  isSearchHelpModalShown = false;
  isFilterShown = false;
  isSelectAllChecked = false;
  searchHelpMeta: SearchHelp;
  fuzzySearchTerm: string;
  selectedIndex = -1;
  filterFields = [];
  listFields = [];
  filterFieldsFormGroup: FormGroup;
  exportControl: any;
  afterExportFn: any;
  listData = [];

  get displaySearchHelpModal() {return this.isSearchHelpModalShown ? 'block' : 'none'; }

  constructor(private fb: FormBuilder,
              private entityService: EntityService) { }

  ngOnInit() {
    this.filterFieldsFormGroup = this.fb.group({});
  }

  openSearchHelpModal(searchHelpMeta: SearchHelp, exportControl: any, afterExportFn?: any) {
    this.searchHelpMeta = searchHelpMeta;
    this.exportControl = exportControl;
    this.afterExportFn = afterExportFn;
    this.filterFieldsFormGroup = this.fb.group({});
    this.filterFields = this.searchHelpMeta.FIELDS.filter( fieldMeta => fieldMeta.FILTER_POSITION );
    this.filterFields.sort((a, b) => a.FILTER_POSITION - b.FILTER_POSITION);
    this.filterFields.forEach( fieldMeta => {
      if (fieldMeta.IMPORT && exportControl.get(fieldMeta.FIELD_NAME)) {
        fieldMeta.DEFAULT_VALUE = exportControl.get(fieldMeta.FIELD_NAME).value; }
      this.filterFieldsFormGroup.addControl(fieldMeta.FIELD_NAME, this.fb.control(fieldMeta.DEFAULT_VALUE));
    });

    this.listFields = this.searchHelpMeta.FIELDS.filter( fieldMeta => fieldMeta.LIST_POSITION );
    this.listFields.sort((a, b) => a.LIST_POSITION - b.LIST_POSITION);

    if (this.searchHelpMeta.BEHAVIOUR === 'A') {
      this.search();
      this.isFilterShown = false;
    } else {
      this.isFilterShown = true;
    }
    this.isSearchHelpModalShown = true;
  }

  openSearchHelpModalByEntity(entityID: string, exportControl: any, readonly: boolean, afterExportFn?: any) {
    const searchHelpMeta = new SearchHelp();
    searchHelpMeta.OBJECT_NAME = entityID;
    searchHelpMeta.METHOD = function(entityService: EntityService): SearchHelpMethod {
      return (searchTerm: QueryObject): Observable<object[]> => entityService.searchEntities(searchTerm);
    }(this.entityService);
    searchHelpMeta.BEHAVIOUR = 'M';
    searchHelpMeta.MULTI = false;
    searchHelpMeta.FUZZY_SEARCH = false;
    searchHelpMeta.FIELDS = [];
    searchHelpMeta.READ_ONLY = readonly;
    searchHelpMeta.ENTITY_ID = entityID;
    searchHelpMeta.RELATION_ID = entityID;
    this.entityService.getRelationMeta(entityID)
      .subscribe(data => {
        const relationMeta = <RelationMeta>data;
        relationMeta.ATTRIBUTES.forEach( attribute =>
          searchHelpMeta.FIELDS.push({
            FIELD_NAME: attribute.ATTR_NAME,
            FIELD_DESC: attribute.ATTR_DESC,
            IMPORT: false,
            EXPORT: false,
            LIST_POSITION: attribute.ORDER,
            FILTER_POSITION: attribute.ORDER
          }));
        searchHelpMeta.FIELDS.push({
          FIELD_NAME: 'INSTANCE_GUID',
          FIELD_DESC: 'Instance GUID',
          IMPORT: false,
          EXPORT: true,
          LIST_POSITION: 999,
          FILTER_POSITION: 0});
        this.openSearchHelpModal(searchHelpMeta, exportControl, afterExportFn);
      });
  }

  search() {
    let searchTerm;
    if (this.searchHelpMeta.FUZZY_SEARCH) {
      searchTerm = this.fuzzySearchTerm || '';
    } else {
      searchTerm = new QueryObject();
      searchTerm.ENTITY_ID = this.searchHelpMeta.ENTITY_ID;
      searchTerm.RELATION_ID = this.searchHelpMeta.RELATION_ID;
      searchTerm.FILTER = [];
      this.filterFields.forEach( fieldMeta => {
        const fieldValue = this.filterFieldsFormGroup.get(fieldMeta.FIELD_NAME).value;
        if (fieldValue) {
          if (fieldValue.includes('*') || fieldValue.includes('%')) {
            searchTerm.FILTER.push({FIELD_NAME: fieldMeta.FIELD_NAME, OPERATOR: 'CN', LOW: fieldValue});
          } else {
            searchTerm.FILTER.push({FIELD_NAME: fieldMeta.FIELD_NAME, OPERATOR: 'EQ', LOW: fieldValue});
          }
        }
      });
    }

    this.listData = [];
    this.isSelectAllChecked = false;
    if (typeof this.searchHelpMeta.METHOD === 'function') {
      const searchHelpMethod = <SearchHelpMethod>this.searchHelpMeta.METHOD;
      searchHelpMethod(searchTerm).subscribe( data => this._generateSearchList(data));
    } else if (Array.isArray(this.searchHelpMeta.METHOD )) {
      this._generateSearchList(this.searchHelpMeta.METHOD);
    }
  }

  _generateSearchList(data: object[]): void {
    data.forEach( item => {
      const listItem = {SELECTED: ''};
      this.listFields.forEach( field => listItem[field.FIELD_NAME] = item[field.FIELD_NAME]);
      this.listData.push(listItem);
    });
  }

  enterSearch($event): void {
    if ($event.keyCode === 13 ) {
      this.search();
    }
  }

  showFilter() {
    this.isFilterShown = true;
  }

  hideFilter() {
    this.isFilterShown = false;
  }

  selectAll() {
    this.isSelectAllChecked = !this.isSelectAllChecked;
    this.listData.forEach( data => data.SELECTED = !data.SELECTED );
  }

  confirmSelection() {
    // TODO: Currently, only single selection is supported. Multiple selection in later time
    if (this.searchHelpMeta.READ_ONLY) {return; }
    this.listFields.forEach( listField => {
      if (this.exportControl.constructor && this.exportControl.constructor.name === 'FormGroup') {
        const exportControl = <AbstractControl>this.exportControl;
        const exportFieldControl = exportControl.get(listField.FIELD_NAME);
        if (listField.EXPORT && exportFieldControl) {
          exportFieldControl.setValue(this.listData[this.selectedIndex][listField.FIELD_NAME]);
          exportFieldControl.markAsDirty();
        }
      } else {
        if (listField.EXPORT) {
          this.exportControl[listField.FIELD_NAME] = this.listData[this.selectedIndex][listField.FIELD_NAME];
        }
      }
    });

    if (this.afterExportFn) { this.afterExportFn(); }
    this.isSearchHelpModalShown = false;
  }

  closeSearchHelpModal() {
    this.isSearchHelpModalShown = false;
  }
}
