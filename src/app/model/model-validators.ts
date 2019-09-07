import { Injectable } from '@angular/core';
import {AbstractControl, AsyncValidator, ValidationErrors} from '@angular/forms';
import {EntityService} from 'jor-angular';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {ModelService} from './model.service';

// noinspection JSAnnotator
@Injectable({
  providedIn: 'root'
})
export class UniqueDataElementValidator implements AsyncValidator {
  constructor(private entityService: EntityService,
              private modelService: ModelService) {}

  validate(
    ctrl: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return this.entityService.getDataElementDesc(ctrl.value).pipe(
      map(data => {
        if (data['msgName'] && data['msgName'] === 'DATA_ELEMENT_NOT_EXIST') {
          this.modelService.updateDataElementID(ctrl.value);
          return null;
        } else {
          return { message: '"' + ctrl.value + '" already exists' };
        }
      }),
      catchError(() => null)
    );
  }
}

// noinspection JSAnnotator
@Injectable({
  providedIn: 'root'
})
export class UniqueRoleValidator implements AsyncValidator {
  constructor(private entityService: EntityService,
              private modelService: ModelService) {}

  validate(
    ctrl: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return this.entityService.getRoleDesc(ctrl.value).pipe(
      map(data => {
        if (data['msgName'] && data['msgName'] === 'ROLE_NOT_EXIST') {
          this.modelService.updateRoleID(ctrl.value);
          return null;
        } else {
          return { message: '"' + ctrl.value + '" already exists' };
        }
      }),
      catchError(() => null)
    );
  }
}

// noinspection JSAnnotator
@Injectable({
  providedIn: 'root'
})
export class UniqueRelationValidator implements AsyncValidator {
  constructor(private entityService: EntityService,
              private modelService: ModelService) {}

  validate(
    ctrl: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    if (ctrl.value === 'r_') { return of(null); }
    return this.entityService.getRelationDesc(ctrl.value).pipe(
      map(data => {
        if (data['msgName'] && data['msgName'] === 'RELATION_NOT_EXIST') {
          this.modelService.updateRelationID(ctrl.value);
          return null;
        } else {
          return { message: '"' + ctrl.value + '" already exists' };
        }
      }),
      catchError(() => null)
    );
  }
}

// noinspection JSAnnotator
@Injectable({
  providedIn: 'root'
})
export class UniqueRelationshipValidator implements AsyncValidator {
  constructor(private entityService: EntityService,
              private modelService: ModelService) {}

  validate(
    ctrl: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    if (ctrl.value === 'rs_') { return of(null); }
    return this.entityService.getRelationshipDesc(ctrl.value).pipe(
      map(data => {
        if (data['msgName'] && data['msgName'] === 'RELATIONSHIP_NOT_EXIST') {
          this.modelService.updateRelationshipID(ctrl.value);
          return null;
        } else {
          return { message: '"' + ctrl.value + '" already exists' };
        }
      }),
      catchError(() => null)
    );
  }
}

// noinspection JSAnnotator
@Injectable({
  providedIn: 'root'
})
export class UniqueEntityTypeValidator implements AsyncValidator {
  constructor(private entityService: EntityService,
              private modelService: ModelService) {}

  validate(
    ctrl: AbstractControl
  ): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    return this.entityService.getEntityTypeDesc(ctrl.value).pipe(
      map(data => {
        if (data['msgName'] && data['msgName'] === 'ENTITY_TYPE_NOT_EXIST') {
          this.modelService.updateEntityID(ctrl.value);
          return null;
        } else {
          return { message: '"' + ctrl.value + '" already exists' };
        }
      }),
      catchError(() => null)
    );
  }
}
