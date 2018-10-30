import { Component, OnInit } from '@angular/core';
import {EntityService} from '../../entity.service';
import {EntityType} from '../../entity';
import { debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {Router} from '@angular/router';
// import {Subject} from 'rxjs/internal/Subject';

@Component({
  selector: 'app-entity-type',
  templateUrl: './entity-type.component.html',
  styleUrls: ['./entity-type.component.css']
})
export class EntityTypeComponent implements OnInit {
  entityTypeList: EntityType[];
  private searchTerms = new Subject<string>();

  constructor(private entityService: EntityService,
              private router: Router) { }

  ngOnInit() {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this.entityService.listEntityType(term)),
    ).subscribe(data => this.entityTypeList = data );
    this.searchEntityType(''); // The initial list
  }

  searchEntityType(term: string): void {
    this.searchTerms.next(term);
  }

  newEntityType(): void {
    this.router.navigate(['/model/entity-type/new']);
  }
}
