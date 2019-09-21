import { Component, OnInit } from '@angular/core';
import {Subject} from 'rxjs';
import {ModelService} from '../model.service';
import {MessageService} from 'ui-message-angular';
import {ActivatedRoute, Router} from '@angular/router';
import {msgStore} from '../../msgStore';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {DataElementH, EntityService, DataElementMeta} from 'jor-angular';

@Component({
  selector: 'app-data-element',
  templateUrl: './data-element.component.html',
  styleUrls: ['./data-element.component.css']
})
export class DataElementComponent implements OnInit {
  dataElementList: DataElementH[] = [];
  isSearchListShown = true;
  private searchTerms = new Subject<string>();
  private theSelectedDataElement: DataElementH;

  constructor(private entityService: EntityService,
              private modelService: ModelService,
              private messageService: MessageService,
              private route: ActivatedRoute,
              private router: Router) {
    this.messageService.setMessageStore(msgStore, 'EN');
  }

  ngOnInit() {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this.entityService.listDataElement(term)),
    ).subscribe(data => {
      this.dataElementList = data;
      let elementID;
      if (this.route.snapshot.firstChild) {
        elementID = this.route.snapshot.firstChild.paramMap.get('elementID');
      }
      if (elementID ) {
        if (elementID === 'new') {
          this._newDataElement();
        } else {
          this.onSelect(this.dataElementList.find(dataEle => dataEle.ELEMENT_ID === elementID));
        }
      }
    });
    this.searchDataElement(''); // The initial list

    this.modelService.theSelectedDataElement$.subscribe( data => {
      if (this.theSelectedDataElement) {
        this.theSelectedDataElement.ELEMENT_ID = data['ELEMENT_ID'];
        this.theSelectedDataElement.ELEMENT_DESC = data['ELEMENT_DESC'];
      }
    });

    this.modelService.dialogAnswer$.subscribe( answer => {
      if (answer === 'OK' && this.dataElementList[0] && !this.dataElementList[0].CREATE_TIME) {
        this.dataElementList.splice(0, 1); // Remove the first one.
      } else if (answer === 'CANCEL') {
        const elementID = this.route.snapshot.firstChild.paramMap.get('elementID');
        if (elementID) {
          if (elementID === 'new') {
            this.onSelect(this.dataElementList[0]);
          } else {
            this.onSelect(this.dataElementList.find(dataElement => dataElement.ELEMENT_ID === elementID));
          }
        }
      }
    });

    this.modelService.isSearchListShown$.subscribe( data => this.isSearchListShown = data);
  }

  hideSearchList(): void {
    this.isSearchListShown = false;
    this.modelService.hideSearchList();
  }

  onSelect(dataElement: DataElementH): void {
    if (dataElement) {
      this.theSelectedDataElement = dataElement;
      this.modelService.setSelectedDataElement(dataElement);
    }
  }

  searchDataElement(term: string): void {
    this.searchTerms.next(term);
  }

  newDataElement(): void {
    if (this.route.snapshot.firstChild && this.route.snapshot.firstChild.paramMap.get('elementID') === 'new') {
      this.messageService.reportMessage('MODEL', 'UNSAVED_NEW', 'E');
    } else {
      this._newDataElement();
      this.router.navigate(['/model/data-element/new']);
    }
  }

  _newDataElement(): void {
    this.theSelectedDataElement = new DataElementMeta();
    this.theSelectedDataElement.ELEMENT_ID = 'new';
    this.theSelectedDataElement.ELEMENT_DESC = 'description';
    this.theSelectedDataElement.VERSION_NO = 1;
    this.theSelectedDataElement.LAST_CHANGE_BY = 'DH001';
    this.theSelectedDataElement.LAST_CHANGE_TIME = new Date().toDateString();
    this.modelService.setSelectedDataElement(this.theSelectedDataElement);
    this.dataElementList.splice(0, 0, this.theSelectedDataElement);
  }
}
