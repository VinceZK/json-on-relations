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

  /**
   * Open an search help dialog with free style
   * @param searchHelpMeta
   * @param exportControl
   * @param afterExportFn
   */
  openSearchHelpModal(searchHelpMeta: SearchHelp, exportControl: any, afterExportFn?: any) {
    this.searchHelpMeta = searchHelpMeta;
    this.exportControl = exportControl;
    this.afterExportFn = afterExportFn;
    this.filterFieldsFormGroup = this.fb.group({});
    this.filterFields = this.searchHelpMeta.FIELDS.filter( fieldMeta => fieldMeta.FILTER_POSITION );
    this.filterFields.sort((a, b) => a.FILTER_POSITION - b.FILTER_POSITION);
    this.filterFields.forEach( fieldMeta => {
      if (fieldMeta.IMPORT) {
        const ieFieldName = fieldMeta.IE_FIELD_NAME || fieldMeta.FIELD_NAME;
        if (exportControl.get(ieFieldName)) { fieldMeta.DEFAULT_VALUE = exportControl.get(ieFieldName).value;  }
      }
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

  /**
   * Open a search help dialog based on the given entity and one of its relation
   * @param entityID
   * @param relationID
   * @param exportControl
   * @param readonly
   * @param exportField: Provided only if the exportField name is not the same with the attribute name
   * @param domainID: Provided only if exportField is given. It is  to make sure that different attribute names must share the same domain.
   * For example, attribute "CREATE_BY" and "USER_ID" share the same domain "USER_ID". When the search help dialog pop up on CREATE_BY,
   * It should query on the entity "USER", and the value of attribute "USER_ID" is exported to "CREATE_BY"
   * @param afterExportFn
   */
  openSearchHelpModalByEntity(entityID: string, relationID: string, exportControl: any,
                              readonly: boolean, exportField?: string, domainID?: string, afterExportFn?: any) {
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
    searchHelpMeta.RELATION_ID = relationID;
    this.entityService.getRelationMeta(relationID)
      .subscribe(data => {
        const relationMeta = <RelationMeta>data;
        relationMeta.ATTRIBUTES.forEach( attribute =>
          searchHelpMeta.FIELDS.push({
            FIELD_NAME: attribute.ATTR_NAME,
            LABEL_TEXT: attribute.LABEL_TEXT,
            LIST_HEADER_TEXT: attribute.LIST_HEADER_TEXT,
            IE_FIELD_NAME: exportField && domainID && domainID === attribute.DOMAIN_ID ? exportField : null,
            IMPORT: attribute.PRIMARY_KEY || attribute.DOMAIN_ID === domainID,
            EXPORT: attribute.PRIMARY_KEY || attribute.DOMAIN_ID === domainID,
            LIST_POSITION: attribute.ORDER,
            FILTER_POSITION: attribute.ORDER
          }));
        searchHelpMeta.FIELDS.push({
          FIELD_NAME: 'INSTANCE_GUID',
          LIST_HEADER_TEXT: 'GUID',
          IMPORT: false,
          EXPORT: true,
          LIST_POSITION: 999,
          FILTER_POSITION: 0});
        this.openSearchHelpModal(searchHelpMeta, exportControl, afterExportFn);
      });
  }

  /**
   * Open a search help dialog based on the given search help
   * @param searchHelpID
   * @param searchHelpExportField: one searchHelp field which is exported in the searchHelp
   * @param exportField: a field control name of Angular form control
   * @param exportControl: an Angular form control
   * @param readonly
   * @param afterExportFn
   */
  openSearchHelpBySearchHelp(searchHelpID: string, searchHelpExportField: string, exportField: string,
                             exportControl: any, readonly: boolean, afterExportFn?: any) {
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
