import { Component, OnInit } from '@angular/core';
import {Relation} from '../../entity';
import {Subject} from 'rxjs';
import {EntityService} from '../../entity.service';
import {ActivatedRoute, Router} from '@angular/router';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {ModelService} from '../model.service';
import {MessageService} from 'ui-message-angular';
import {msgStore} from '../../msgStore';

@Component({
  selector: 'dk-relation',
  templateUrl: './relation.component.html',
  styleUrls: ['./relation.component.css']
})
export class RelationComponent implements OnInit {

  relationList: Relation[];
  private searchTerms = new Subject<string>();
  private theSelectedRelation: Relation;

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
      switchMap((term: string) => this.entityService.listRelation(term)),
    ).subscribe(data => {
      this.relationList = data;
      let relationID;
      if (this.route.snapshot.firstChild) {
        relationID = this.route.snapshot.firstChild.paramMap.get('relationID');
      }
      if (relationID) {
        if (relationID === 'new') {
          this._newRelation();
        } else {
          this.onSelect(this.relationList.find(relation => relation.RELATION_ID === relationID));
        }
      }
    });
    this.searchRelation(''); // The initial list

    this.modelService.theSelectedRelation$.subscribe( data => {
      if (this.theSelectedRelation) {
        this.theSelectedRelation.RELATION_ID = data.RELATION_ID;
        this.theSelectedRelation.RELATION_DESC = data.RELATION_DESC;
      }
    });

    this.modelService.dialogAnswer$.subscribe( answer => {
      if (answer === 'OK' && !this.relationList[0].CREATE_TIME) {
        this.relationList.splice(0, 1); // Remove the first one.
      } else if (answer === 'CANCEL') {
        const relationID = this.route.snapshot.firstChild.paramMap.get('relationID');
        if (relationID) {
          if (relationID === 'new') {
            this.onSelect(this.relationList[0]);
          } else {
            this.onSelect(this.relationList.find(relation => relation.RELATION_ID === relationID));
          }
        }
      }
    });
  }

  searchRelation(term: string): void {
    this.searchTerms.next(term);
  }

  onSelect(relation: Relation): void {
    if (relation) {
      this.theSelectedRelation = relation;
      this.modelService.setSelectedRelation(relation);
    }
  }

  newRelation(): void {
    if (this.route.snapshot.firstChild && this.route.snapshot.firstChild.paramMap.get('relationID') === 'new') {
      this.messageService.reportMessage('MODEL', 'UNSAVED_NEW', 'E');
    } else {
      this._newRelation();
      this.router.navigate(['/model/relation/new']);
    }
  }

  _newRelation(): void {
    this.theSelectedRelation = new Relation();
    this.theSelectedRelation.RELATION_ID = 'r_new';
    this.theSelectedRelation.RELATION_DESC = 'description';
    this.theSelectedRelation.VERSION_NO = 1;
    this.theSelectedRelation.LAST_CHANGE_BY = 'DH001';
    this.theSelectedRelation.LAST_CHANGE_TIME = new Date().toDateString();
    this.modelService.setSelectedRelation(this.theSelectedRelation);
    this.relationList.splice(0, 0, this.theSelectedRelation);
  }
}
