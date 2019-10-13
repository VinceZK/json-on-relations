import {Injectable} from '@angular/core';
import {AbstractControl, AsyncValidator, ValidationErrors} from '@angular/forms';
import {EntityService} from 'jor-angular';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {QueryObject} from 'jor-angular';

// noinspection JSAnnotator
@Injectable({
  providedIn: 'root'
})
export class DomainValueValidator implements AsyncValidator {
  constructor(private entityService: EntityService) {}

  validate(
    ctrl: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    const queryObject = new QueryObject();
    // queryObject.ENTITY_ID = entityID;
    // queryObject.RELATION_ID = relationID;
    // queryObject.FILTER = [{FIELD_NAME: searchField, OPERATOR: 'EQ', LOW: ctrl.value}];
    return this.entityService.searchEntities(queryObject).pipe(
      map(data => {
        if (data['msgName']) {
          return { message: data['msgName']['msgShortText'] };
        } else {
          if (data.length === 0) {
            return { message: 'Value is invalid' };
          } else {
            return null;
          }
        }
      }),
      catchError(() => null)
    );
  }
}
