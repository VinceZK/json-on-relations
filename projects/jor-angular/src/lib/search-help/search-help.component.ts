import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {QueryObject, RelationMeta, SearchHelpMeta} from '../entity';
import {EntityService} from '../entity.service';
import {Observable} from 'rxjs';
import {SearchHelp, SearchHelpMethod} from './search-help';

@Component({
  selector: 'dk-app-search-help',
  templateUrl: './search-help.component.html',
  styleUrls: ['./search-help.component.css']
})
export class SearchHelpComponent implements OnInit {
  isSearchHelpModalShown = false;
  isFilterShown = false;
  isSelectAllChecked = false;
  searchHelp: SearchHelp;
  fuzzySearchTerm: string;
  selectedIndex = -1;
  filterFields = [];
  listFields = [];
  filterFieldsFormGroup: FormGroup;
  exportControl: any;
  afterExportFn: any;
  listData = [];
  preSearchHelpParas = {};

  get displaySearchHelpModal() {return this.isSearchHelpModalShown ? 'block' : 'none'; }

  constructor(private fb: FormBuilder,
              private entityService: EntityService) { }

  ngOnInit() {
    this.filterFieldsFormGroup = this.fb.group({});
  }

  /**
   * Open an search help dialog with free style
   * @param searchHelp
   * @param exportControl: An Angular form control which is used to receive the Search Help returned value.
   * @param afterExportFn: Optional. If provided, the function will be executed after the value is returned.
   */
  openSearchHelpModal(searchHelp: SearchHelp, exportControl: any, afterExportFn?: any) {
    if (this.searchHelp !== searchHelp) {
      this.listData = [];
      this.searchHelp = searchHelp;
      this.exportControl = exportControl;
      this.afterExportFn = afterExportFn;
      this.filterFieldsFormGroup = this.fb.group({});
      this.filterFields = this.searchHelp.FIELDS.filter( fieldMeta => fieldMeta.FILTER_POSITION );
      this.filterFields.sort((a, b) => a.FILTER_POSITION - b.FILTER_POSITION);
      this.filterFields.forEach( fieldMeta => {
        if (fieldMeta.IMPORT) {
          const ieFieldName = fieldMeta.IE_FIELD_NAME || fieldMeta.FIELD_NAME;
          if (exportControl.get(ieFieldName)) { fieldMeta.DEFAULT_VALUE = exportControl.get(ieFieldName).value;  }
        }
        this.filterFieldsFormGroup.addControl(fieldMeta.FIELD_NAME, this.fb.control(fieldMeta.DEFAULT_VALUE));
      });

      this.listFields = this.searchHelp.FIELDS.filter( fieldMeta => fieldMeta.LIST_POSITION );
      this.listFields.sort((a, b) => a.LIST_POSITION - b.LIST_POSITION);
    }

    if (this.searchHelp.BEHAVIOUR === 'A') {
      this.search();
      this.isFilterShown = false;
    } else {
      this.isFilterShown = true;
    }
    this.isSearchHelpModalShown = true;
  }

  /**
   * Open a search help dialog based on the given entity and one of its relation
   * @param entityID
   * @param relationID
   * @param exportControl: An Angular form control which is used to receive the Search Help returned value.
   * @param readonly: If readonly, then the Search Help cannot return value.
   * @param exportField: Provided only if exportField is given. It uses the data domain to find which attribute should return the value(s).
   For example, attribute "USER" is assigned with Data Domain "USER_ID". When the Search Help dialog pops up on the field 'CREATE_BY',
   it finds the attribute "USER" using the Data Domain "USER_ID",
   and the value of its attribute "USER" is then exported to the field "CREATE_BY".
   * @param afterExportFn: Optional. If provided, the function will be executed after the value is returned.
   */
  openSearchHelpModalByEntity(entityID: string, relationID: string, exportControl: any,
                              readonly: boolean, exportField?: string, domainID?: string, afterExportFn?: any) {
    const currentSearchHelpParas = {
      'entityID': entityID,
      'relationID': relationID,
      'exportField': exportField,
      'domainID': domainID
    };
    if (this._isPreviousSearchHelp(currentSearchHelpParas)) {
      this.searchHelp.READ_ONLY = readonly;
      this.openSearchHelpModal(this.searchHelp, exportControl, afterExportFn);
    } else {
      this.listData = [];
      this.preSearchHelpParas = currentSearchHelpParas;
      const searchHelp = new SearchHelp();
      searchHelp.OBJECT_NAME = entityID;
      searchHelp.METHOD = function(entityService: EntityService): SearchHelpMethod {
        return (searchTerm: QueryObject): Observable<object[]> => entityService.searchEntities(searchTerm);
      }(this.entityService);
      searchHelp.BEHAVIOUR = 'M';
      searchHelp.MULTI = false;
      searchHelp.FUZZY_SEARCH = false;
      searchHelp.FIELDS = [];
      searchHelp.READ_ONLY = readonly;
      searchHelp.ENTITY_ID = entityID;
      searchHelp.RELATION_ID = relationID;
      this.entityService.getRelationMeta(relationID)
        .subscribe(data => {
          const relationMeta = <RelationMeta>data;
          relationMeta.ATTRIBUTES.forEach( attribute =>
            searchHelp.FIELDS.push({
              FIELD_NAME: attribute.ATTR_NAME,
              LABEL_TEXT: attribute.LABEL_TEXT,
              LIST_HEADER_TEXT: attribute.LIST_HEADER_TEXT,
              IE_FIELD_NAME: exportField && domainID && domainID === attribute.DOMAIN_ID ? exportField : null,
              IMPORT: attribute.PRIMARY_KEY || attribute.DOMAIN_ID === domainID,
              EXPORT: attribute.PRIMARY_KEY || attribute.DOMAIN_ID === domainID,
              LIST_POSITION: attribute.ORDER,
              FILTER_POSITION: attribute.ORDER
            }));
          searchHelp.FIELDS.push({
            FIELD_NAME: 'INSTANCE_GUID',
            LIST_HEADER_TEXT: 'GUID',
            IMPORT: false,
            EXPORT: true,
            LIST_POSITION: 999,
            FILTER_POSITION: 0});
          this.openSearchHelpModal(searchHelp, exportControl, afterExportFn);
        });
    }
  }

  /**
   * Open a search help dialog based on the given search help
   * @param searchHelpID
   * @param searchHelpExportField: a field name in the Search Help which is tagged as exported.
   An Search Help can have multiple exported fields, and the field names may be different with the Angular control names.
   Thus, you can choose one Search Help export field name to map with one Angular field control name.
   * @param exportField: An Angular field control name that is to map with the Search Help export field name.
   * @param exportControl: An Angular form control which is used to receive the Search Help returned value.
   * @param readonly: If readonly, then the Search Help cannot return value.
   * @param afterExportFn: Optional. If provided, the function will be executed after the value is returned.
   */
  openSearchHelpModalBySearchHelp(searchHelpID: string, searchHelpExportField: string, exportField: string,
                             exportControl: any, readonly: boolean, afterExportFn?: any) {
    const currentSearchHelpParas = {
      'searchHelpID': searchHelpID,
      'searchHelpExportField': searchHelpExportField,
      'exportField': exportField
    };
    if (this._isPreviousSearchHelp(currentSearchHelpParas)) {
      this.searchHelp.READ_ONLY = readonly;
      this.openSearchHelpModal(this.searchHelp, exportControl, afterExportFn);
    } else {
      this.listData = [];
      this.preSearchHelpParas = currentSearchHelpParas;
      const searchHelp = new SearchHelp();
      this.entityService.getSearchHelp(searchHelpID)
        .subscribe((searchHelpMeta: SearchHelpMeta) => {
          searchHelp.OBJECT_NAME = searchHelpMeta.SEARCH_HELP_DESC + '(' + searchHelpMeta.SEARCH_HELP_ID + ')';
          searchHelp.METHOD = function(entityService: EntityService): SearchHelpMethod {
            return (searchTerm: QueryObject): Observable<object[]> => entityService.searchEntities(searchTerm);
          }(this.entityService);
          searchHelp.BEHAVIOUR = searchHelpMeta.BEHAVIOUR;
          searchHelp.MULTI = searchHelpMeta.MULTI;
          searchHelp.FUZZY_SEARCH = searchHelpMeta.FUZZY_SEARCH;
          searchHelp.READ_ONLY = readonly;
          searchHelp.ENTITY_ID = searchHelpMeta.ENTITY_ID;
          searchHelp.RELATION_ID = searchHelpMeta.RELATION_ID;
          searchHelp.FIELDS = searchHelpMeta.FIELDS;
          const searchHelpField = searchHelp.FIELDS.find(
            field => (field.IE_FIELD_NAME || field.FIELD_NAME) === searchHelpExportField);
          searchHelpField.IE_FIELD_NAME = exportField;
          searchHelpField.EXPORT = true;
          searchHelpField.IMPORT = true;
          searchHelp.FIELDS.push({
            FIELD_NAME: 'INSTANCE_GUID',
            LIST_HEADER_TEXT: 'GUID',
            IMPORT: false,
            EXPORT: true,
            LIST_POSITION: 999,
            FILTER_POSITION: 0});
          this.openSearchHelpModal(searchHelp, exportControl, afterExportFn);
        });
    }
  }

  _isPreviousSearchHelp(currentSearchHelpParas: object): boolean {
    return JSON.stringify(this.preSearchHelpParas) === JSON.stringify(currentSearchHelpParas);
  }

  search() {
    let searchTerm;
    if (this.searchHelp.FUZZY_SEARCH) {
      searchTerm = this.fuzzySearchTerm || '';
    } else {
      searchTerm = new QueryObject();
      searchTerm.ENTITY_ID = this.searchHelp.ENTITY_ID;
      searchTerm.RELATION_ID = this.searchHelp.RELATION_ID;
      searchTerm.FILTER = [];
      this.filterFields.forEach( fieldMeta => {
        const fieldValue = this.filterFieldsFormGroup.get(fieldMeta.FIELD_NAME).value;
        if (fieldValue) {
          if (fieldValue.includes('*') || fieldValue.includes('%')) {
            searchTerm.FILTER.push({RELATION_ID: fieldMeta.RELATION_ID,
              FIELD_NAME: fieldMeta.FIELD_NAME, OPERATOR: 'CN', LOW: fieldValue});
          } else {
            searchTerm.FILTER.push({RELATION_ID: fieldMeta.RELATION_ID,
              FIELD_NAME: fieldMeta.FIELD_NAME, OPERATOR: 'EQ', LOW: fieldValue});
          }
        }
      });
      searchTerm.PROJECTION = [];
      this.listFields.forEach( fieldMeta => {
        searchTerm.PROJECTION.push({RELATION_ID: fieldMeta.RELATION_ID, FIELD_NAME: fieldMeta.FIELD_NAME});
      });
    }

    this.listData = [];
    this.isSelectAllChecked = false;
    if (typeof this.searchHelp.METHOD === 'function') {
      const searchHelpMethod = <SearchHelpMethod>this.searchHelp.METHOD;
      searchHelpMethod(searchTerm).subscribe( data => this._generateSearchList(data));
    } else if (Array.isArray(this.searchHelp.METHOD )) {
      this._generateSearchList(this.searchHelp.METHOD);
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
    if (this.searchHelp.READ_ONLY) {return; }
    this.listFields.forEach( listField => {
      if (this.exportControl instanceof FormGroup) {
        const exportControl = <AbstractControl>this.exportControl;
        const ieFieldName = listField.IE_FIELD_NAME || listField.FIELD_NAME;
        const exportFieldControl = exportControl.get(ieFieldName);
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
    this.listData = [];
    this.isSearchHelpModalShown = false;
  }

  closeSearchHelpModal() {
    this.isSearchHelpModalShown = false;
  }
}
