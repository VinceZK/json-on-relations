import { Component, OnInit } from '@angular/core';
import {Subject} from 'rxjs';
import {ModelService} from '../model.service';
import {MessageService} from 'ui-message-angular';
import {ActivatedRoute, Router} from '@angular/router';
import {msgStore} from '../../msgStore';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {DataDomainH, DataDomainMeta, EntityService} from 'jor-angular';

@Component({
  selector: 'app-data-domain',
  templateUrl: './data-domain.component.html',
  styleUrls: ['./data-domain.component.css']
})
export class DataDomainComponent implements OnInit {
  dataDomainList: DataDomainH[] = [];
  isSearchListShown = true;
  private searchTerms = new Subject<string>();
  private theSelectedDataDomain: DataDomainH;

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
      switchMap((term: string) => this.entityService.listDataDomain(term)),
    ).subscribe(data => {
      this.dataDomainList = data;
      let domainID;
      if (this.route.snapshot.firstChild) {
        domainID = this.route.snapshot.firstChild.paramMap.get('domainID');
      }
      if (domainID ) {
        if (domainID === 'new') {
          this._newDataDomain();
        } else {
          this.onSelect(this.dataDomainList.find(dataDomain => dataDomain.DOMAIN_ID === domainID));
        }
      }
    });
    this.searchDataDomain(''); // The initial list

    this.modelService.theSelectedDataDomain$.subscribe( data => {
      if (this.theSelectedDataDomain) {
        this.theSelectedDataDomain.DOMAIN_ID = data['DOMAIN_ID'];
        this.theSelectedDataDomain.DOMAIN_DESC = data['DOMAIN_DESC'];
      }
    });

    this.modelService.dialogAnswer$.subscribe( answer => {
      if (answer === 'OK' && this.dataDomainList[0] && !this.dataDomainList[0].CREATE_TIME) {
        this.dataDomainList.splice(0, 1); // Remove the first one.
      } else if (answer === 'CANCEL') {
        const domainID = this.route.snapshot.firstChild.paramMap.get('domainID');
        if (domainID) {
          if (domainID === 'new') {
            this.onSelect(this.dataDomainList[0]);
          } else {
            this.onSelect(this.dataDomainList.find(dataDomain => dataDomain.DOMAIN_ID === domainID));
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

  onSelect(dataDomain: DataDomainH): void {
    if (dataDomain) {
      this.theSelectedDataDomain = dataDomain;
      this.modelService.setSelectedDataDomain(dataDomain);
    }
  }

  searchDataDomain(term: string): void {
    this.searchTerms.next(term);
  }

  newDataDomian(): void {
    if (this.route.snapshot.firstChild && this.route.snapshot.firstChild.paramMap.get('domainID') === 'new') {
      this.messageService.reportMessage('MODEL', 'UNSAVED_NEW', 'E');
    } else {
      this._newDataDomain();
      this.router.navigate(['/model/data-domain/new']);
    }
  }

  _newDataDomain(): void {
    this.theSelectedDataDomain = new DataDomainMeta();
    this.theSelectedDataDomain.DOMAIN_ID = 'new';
    this.theSelectedDataDomain.DOMAIN_DESC = 'description';
    this.theSelectedDataDomain.VERSION_NO = 1;
    this.theSelectedDataDomain.LAST_CHANGE_BY = 'DH001';
    this.theSelectedDataDomain.LAST_CHANGE_TIME = new Date().toDateString();
    this.modelService.setSelectedDataDomain(this.theSelectedDataDomain);
    this.dataDomainList.splice(0, 0, this.theSelectedDataDomain);
  }
}
