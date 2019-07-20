import { Component, OnInit } from '@angular/core';
import { RoleH} from 'jor-angular';
import {Subject} from 'rxjs';
import {EntityService} from 'jor-angular';
import {ModelService} from '../model.service';
import {MessageService} from 'ui-message-angular';
import {ActivatedRoute, Router} from '@angular/router';
import {msgStore} from '../../msgStore';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css']
})
export class RoleComponent implements OnInit {
  roleList: RoleH[];
  isSearchListShown = true;
  private searchTerms = new Subject<string>();
  private theSelectedRole: RoleH;

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
      switchMap((term: string) => this.entityService.listRole(term)),
    ).subscribe(data => {
      this.roleList = data;
      let roleID;
      if (this.route.snapshot.firstChild) {
        roleID = this.route.snapshot.firstChild.paramMap.get('roleID');
      }
      if (roleID ) {
        if (roleID === 'new') {
          this._newRole();
        } else {
          this.onSelect(this.roleList.find(role => role.ROLE_ID === roleID ));
        }
      }
    });
    this.searchRole(''); // The initial list

    this.modelService.theSelectedRole$.subscribe( data => {
      if (this.theSelectedRole) {
        this.theSelectedRole.ROLE_ID = data['ROLE_ID'];
        this.theSelectedRole.ROLE_DESC = data['ROLE_DESC'];
      }
    });

    this.modelService.dialogAnswer$.subscribe( answer => {
      if (answer === 'OK' && !this.roleList[0].CREATE_TIME) {
        this.roleList.splice(0, 1); // Remove the first one.
      } else if (answer === 'CANCEL') {
        const roleID = this.route.snapshot.firstChild.paramMap.get('roleID');
        if (roleID) {
          if (roleID === 'new') {
            this.onSelect(this.roleList[0]);
          } else {
            this.onSelect(this.roleList.find(role => role.ROLE_ID === roleID));
          }
        }
      }
    });

    this.modelService.isSearchListShown$.subscribe( data => this.isSearchListShown = data);
  }

  onSelect(role: RoleH): void {
    if (role) {
      this.theSelectedRole = role;
      this.modelService.setSelectedRole(role);
    }
  }

  searchRole(term: string): void {
    this.searchTerms.next(term);
  }

  hideSearchList(): void {
    this.isSearchListShown = false;
    this.modelService.hideSearchList();
  }

  newRole(): void {
    if (this.route.snapshot.firstChild && this.route.snapshot.firstChild.paramMap.get('roleID') === 'new') {
      this.messageService.reportMessage('MODEL', 'UNSAVED_NEW', 'E');
    } else {
      this._newRole();
      this.router.navigate(['/model/role/new']);
    }
  }

  _newRole(): void {
    this.theSelectedRole = new RoleH();
    this.theSelectedRole.ROLE_ID = 'new';
    this.theSelectedRole.ROLE_DESC = 'description';
    this.theSelectedRole.VERSION_NO = 1;
    this.theSelectedRole.LAST_CHANGE_BY = 'DH001';
    this.theSelectedRole.LAST_CHANGE_TIME = new Date().toDateString();
    this.modelService.setSelectedRole(this.theSelectedRole);
    this.roleList.splice(0, 0, this.theSelectedRole);
  }

}
