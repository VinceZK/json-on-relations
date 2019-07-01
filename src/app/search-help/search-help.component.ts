import {Component, Input, OnInit} from '@angular/core';
import {SearchHelp} from 'jor-angular';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-search-help',
  templateUrl: './search-help.component.html',
  styleUrls: ['./search-help.component.css']
})
export class SearchHelpComponent implements OnInit {
  isSearchHelpModalShown = false;
  searchHelpMeta: SearchHelp;
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
    this.listData = this.searchHelpMeta.DATA || [];
    this.isSearchHelpModalShown = true;
  }

  search() {
    const searchTerm = this.filterFieldsFormGroup.get('ROLE_ID').value || '';
    this.searchHelpMeta.METHOD.call(this.searchHelpMeta.SERVICE, searchTerm)
      .subscribe( data => {
        data.forEach( item => {
          const listItem = {SELECTED: ''};
          this.listFields.forEach( field => listItem[field.FIELD_NAME] = item[field.FIELD_NAME]);
          this.listData.push(listItem);
        });
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
  }
}
