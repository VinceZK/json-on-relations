import { Component, OnInit } from '@angular/core';
import { RelationshipH} from 'jor-angular';
import {Subject} from 'rxjs';
import {EntityService} from 'jor-angular';
import {ModelService} from '../model.service';
import {MessageService} from 'ui-message-angular';
import {ActivatedRoute, Router} from '@angular/router';
import {msgStore} from '../../msgStore';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-relationship',
  templateUrl: './relationship.component.html',
  styleUrls: ['./relationship.component.css']
})
export class RelationshipComponent implements OnInit {
  relationshipList: RelationshipH[];
  isSearchListShown = true;
  private searchTerms = new Subject<string>();
  private theSelectedRelationship: RelationshipH;

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
      switchMap((term: string) => this.entityService.listRelationship(term)),
    ).subscribe(data => {
      this.relationshipList = data;
      let relationshipID;
      if (this.route.snapshot.firstChild) {
        relationshipID = this.route.snapshot.firstChild.paramMap.get('relationshipID');
      }
      if (relationshipID ) {
        if (relationshipID === 'new') {
          this._newRelationship();
        } else {
          this.onSelect(this.relationshipList.find(relationship => relationship.RELATIONSHIP_ID === relationshipID));
        }
      }
    });
    this.searchRelationship(''); // The initial list

    this.modelService.theSelectedRelationship$.subscribe( data => {
      if (this.theSelectedRelationship) {
        this.theSelectedRelationship.RELATIONSHIP_ID = data['RELATIONSHIP_ID'];
        this.theSelectedRelationship.RELATIONSHIP_DESC = data['RELATIONSHIP_DESC'];
      }
    });

    this.modelService.dialogAnswer$.subscribe( answer => {
      if (answer === 'OK' && this.relationshipList[0] && !this.relationshipList[0].CREATE_TIME) {
        this.relationshipList.splice(0, 1); // Remove the first one.
      } else if (answer === 'CANCEL') {
        const relationshipID = this.route.snapshot.firstChild.paramMap.get('relationshipID');
        if (relationshipID) {
          if (relationshipID === 'new') {
            this.onSelect(this.relationshipList[0]);
          } else {
            this.onSelect(this.relationshipList.find(relationship => relationship.RELATIONSHIP_ID === relationshipID));
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

  onSelect(relationship: RelationshipH): void {
    if (relationship) {
      this.theSelectedRelationship = relationship;
      this.modelService.setSelectedRelationship(relationship);
    }
  }

  searchRelationship(term: string): void {
    this.searchTerms.next(term);
  }

  newRelationship(): void {
    if (this.route.snapshot.firstChild && this.route.snapshot.firstChild.paramMap.get('relationshipID') === 'new') {
      this.messageService.reportMessage('MODEL', 'UNSAVED_NEW', 'E');
    } else {
      this._newRelationship();
      this.router.navigate(['/model/relationship/new']);
    }
  }

  _newRelationship(): void {
    this.theSelectedRelationship = new RelationshipH();
    this.theSelectedRelationship.RELATIONSHIP_ID = 'new';
    this.theSelectedRelationship.RELATIONSHIP_DESC = 'description';
    this.theSelectedRelationship.VERSION_NO = 1;
    this.theSelectedRelationship.LAST_CHANGE_BY = 'DH001';
    this.theSelectedRelationship.LAST_CHANGE_TIME = new Date().toDateString();
    this.modelService.setSelectedRelationship(this.theSelectedRelationship);
    this.relationshipList.splice(0, 0, this.theSelectedRelationship);
  }
}
