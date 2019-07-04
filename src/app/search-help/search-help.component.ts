import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SearchHelp, SearchHelpMethod} from './search-help.type';

@Component({
  selector: 'app-search-help',
  templateUrl: './search-help.component.html',
  styleUrls: ['./search-help.component.css']
})
export class SearchHelpComponent implements OnInit {
  isSearchHelpModalShown = false;
  searchHelpMeta: SearchHelp;
  fuzzySearchTerm: string;
  selectedIndex = -1;
  filterFields = [];
  listFields = [];
  filterFieldsFormGroup: FormGroup;
  listData = [];

  @Input() data: any;
  get displaySearchHelpModal() {return this.isSearchHelpModalShown ? 'block' : 'none'; }

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.filterFieldsFormGroup = this.fb.group({});
  }

  openSearchHelpModal(searchHelpMeta: SearchHelp) {
    this.searchHelpMeta = searchHelpMeta;
    this.filterFieldsFormGroup = this.fb.group({});
    this.filterFields = this.searchHelpMeta.FIELDS.filter( fieldMeta => fieldMeta.FILTER_POSITION );
    this.filterFields.sort((a, b) => a.FILTER_POSITION - b.FILTER_POSITION);
    this.filterFields.forEach( fieldMeta =>
      this.filterFieldsFormGroup.addControl(fieldMeta.FIELD_NAME, this.fb.control(fieldMeta.DEFAULT_VALUE)));

    this.listFields = this.searchHelpMeta.FIELDS.filter( fieldMeta => fieldMeta.LIST_POSITION );
    this.listFields.sort((a, b) => a.LIST_POSITION - b.LIST_POSITION);

    if (this.searchHelpMeta.BEHAVIOUR === 'A') { this.search(); }
    this.isSearchHelpModalShown = true;
  }

  search() {
    let searchTerm;
    if (this.searchHelpMeta.FUZZYSEARCH) {
      searchTerm = this.fuzzySearchTerm || '';
    } else {

    }
    this.listData = [];
    if (typeof this.searchHelpMeta.METHOD === 'function') {
      const searchHelpMethod = <SearchHelpMethod>this.searchHelpMeta.METHOD;
      searchHelpMethod(searchTerm).subscribe( data => this._generateSearchList(data));
    } else if (Array.isArray(this.searchHelpMeta.METHOD )) {
      this._generateSearchList(this.searchHelpMeta.METHOD);
    }
  }

  _generateSearchList(data: object[]): void {
    console.log(data);
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

  closeSearchHelpModal() {
    this.isSearchHelpModalShown = false;
  }

  confirmSelection() {
     console.log(this.listData);
     console.log(this.selectedIndex);
  }
}
