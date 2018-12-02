import { Component, OnInit } from '@angular/core';
import {EntityService} from '../../entity.service';
import {EntityType} from '../../entity';
import { debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {ModelService} from '../model.service';
import {MessageService} from 'ui-message-angular';
import {msgStore} from '../../msgStore';

@Component({
  selector: 'app-entity-type',
  templateUrl: './entity-type.component.html',
  styleUrls: ['./entity-type.component.css']
})
export class EntityTypeComponent implements OnInit {
  entityTypeList: EntityType[];
  private searchTerms = new Subject<string>();
  private theSelectedEntityType: EntityType;

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
      switchMap((term: string) => this.entityService.listEntityType(term)),
    ).subscribe(data => {
      this.entityTypeList = data;
      let entityID;
      if (this.route.snapshot.firstChild){
        entityID = this.route.snapshot.firstChild.paramMap.get('entityID');
      }
      if (entityID ) {
        if (entityID === 'new') {
          this._newEntityType();
        } else {
          this.onSelect(this.entityTypeList.find(entityType => entityType.ENTITY_ID === entityID));
        }
      }
    });
    this.searchEntityType(''); // The initial list

    this.modelService.theSelectedEntityType$.subscribe( data => {
      if (this.theSelectedEntityType) {
        this.theSelectedEntityType.ENTITY_ID = data.ENTITY_ID;
        this.theSelectedEntityType.ENTITY_DESC = data.ENTITY_DESC;
      }
    });

    this.modelService.dialogAnswer$.subscribe( answer => {
      if (answer === 'OK' && !this.entityTypeList[0].CREATE_TIME) {
        this.entityTypeList.splice(0, 1); // Remove the first one.
      } else if (answer === 'CANCEL') {
        const entityID = this.route.snapshot.firstChild.paramMap.get('entityID');
        if (entityID) {
          if (entityID === 'new') {
            this.onSelect(this.entityTypeList[0]);
          } else {
            this.onSelect(this.entityTypeList.find(entityType => entityType.ENTITY_ID === entityID));
          }
        }
      }
    });
  }

  onSelect(entityType: EntityType): void {
    if (entityType) {
      this.theSelectedEntityType = entityType;
      this.modelService.setSelectedEntityType(entityType);
    }
  }

  searchEntityType(term: string): void {
    this.searchTerms.next(term);
  }

  newEntityType(): void {
    if (this.route.snapshot.firstChild && this.route.snapshot.firstChild.paramMap.get('entityID') === 'new') {
      this.messageService.reportMessage('MODEL', 'UNSAVED_NEW', 'E');
    } else {
      this._newEntityType();
      this.router.navigate(['/model/entity-type/new']);
    }
  }

  _newEntityType(): void {
    this.theSelectedEntityType = new EntityType();
    this.theSelectedEntityType.ENTITY_ID = 'new';
    this.theSelectedEntityType.ENTITY_DESC = 'description';
    this.theSelectedEntityType.VERSION_NO = 1;
    this.theSelectedEntityType.LAST_CHANGE_BY = 'DH001';
    this.theSelectedEntityType.LAST_CHANGE_TIME = new Date().toDateString();
    this.modelService.setSelectedEntityType(this.theSelectedEntityType);
    this.entityTypeList.splice(0, 0, this.theSelectedEntityType);
  }
}
