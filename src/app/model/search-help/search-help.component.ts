import { Component, OnInit } from '@angular/core';
import {EntityService, SearchHelpH, SearchHelpMeta} from 'jor-angular';
import {Subject} from 'rxjs';
import {ModelService} from '../model.service';
import {MessageService} from 'ui-message-angular';
import {ActivatedRoute, Router} from '@angular/router';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {IdentityService} from '../../identity.service';

@Component({
  selector: 'app-search-help',
  templateUrl: './search-help.component.html',
  styleUrls: ['./search-help.component.css']
})
export class SearchHelpComponent implements OnInit {

  searchHelpList: SearchHelpH[] = [];
  isSearchListShown = true;
  private searchTerms = new Subject<string>();
  private theSelectedSearchHelp: SearchHelpH;

  constructor(private entityService: EntityService,
              private modelService: ModelService,
              private messageService: MessageService,
              private identityService: IdentityService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this.entityService.listSearchHelp(term)),
    ).subscribe(data => {
      this.searchHelpList = data;
      let searchHelpID;
      if (this.route.snapshot.firstChild) {
        searchHelpID = this.route.snapshot.firstChild.paramMap.get('searchHelpID');
      }
      if (searchHelpID ) {
        if (searchHelpID === 'new') {
          this._newSearchHelp();
        } else {
          this.onSelect(this.searchHelpList.find(searchHelp => searchHelp.SEARCH_HELP_ID === searchHelpID));
        }
      }
    });
    this.searchSearchHelp(''); // The initial list

    this.modelService.theSelectedSearchHelp$.subscribe( data => {
      if (this.theSelectedSearchHelp) {
        this.theSelectedSearchHelp.SEARCH_HELP_ID = data['SEARCH_HELP_ID'];
        this.theSelectedSearchHelp.SEARCH_HELP_DESC = data['SEARCH_HELP_DESC'];
      }
    });

    this.modelService.dialogAnswer$.subscribe( answer => {
      if (answer === 'OK' && this.searchHelpList[0] && !this.searchHelpList[0].CREATE_TIME) {
        this.searchHelpList.splice(0, 1); // Remove the first one.
      } else if (answer === 'CANCEL') {
        const searchHelpID = this.route.snapshot.firstChild.paramMap.get('searchHelpID');
        if (searchHelpID) {
          if (searchHelpID === 'new') {
            this.onSelect(this.searchHelpList[0]);
          } else {
            this.onSelect(this.searchHelpList.find(searchHelp => searchHelp.SEARCH_HELP_ID === searchHelpID));
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

  onSelect(searchHelp: SearchHelpH): void {
    if (searchHelp) {
      this.theSelectedSearchHelp = searchHelp;
      this.modelService.setSelectedSearchHelp(searchHelp);
    }
  }

  searchSearchHelp(term: string): void {
    this.searchTerms.next(term);
  }

  newSearchHelp(): void {
    if (this.route.snapshot.firstChild && this.route.snapshot.firstChild.paramMap.get('searchHelpID') === 'new') {
      this.messageService.reportMessage('MODEL', 'UNSAVED_NEW', 'E');
    } else {
      this._newSearchHelp();
      this.router.navigate(['/model/search-help/new']);
    }
  }

  _newSearchHelp(): void {
    this.theSelectedSearchHelp = new SearchHelpMeta();
    this.theSelectedSearchHelp.SEARCH_HELP_ID = 'new';
    this.theSelectedSearchHelp.SEARCH_HELP_DESC = 'description';
    this.theSelectedSearchHelp.VERSION_NO = 1;
    this.theSelectedSearchHelp.LAST_CHANGE_BY = this.identityService.Session.USER_ID;
    this.theSelectedSearchHelp.LAST_CHANGE_TIME = this.identityService.CurrentTime;
    this.modelService.setSelectedSearchHelp(this.theSelectedSearchHelp);
    this.searchHelpList.splice(0, 0, this.theSelectedSearchHelp);
  }

}
