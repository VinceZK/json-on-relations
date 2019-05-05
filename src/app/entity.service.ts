import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {Entity, EntityMeta, EntityType, QueryObject, Relation, RelationMeta, RelationshipH, RoleH} from 'jor-angular';
import {catchError} from 'rxjs/operators';
import {MessageService, messageType} from 'ui-message-angular';
import {msgStore} from './msgStore';
import {environment} from '../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class EntityService {
  private originalHost = environment.originalHost;

  constructor(private http: HttpClient,
              private messageService: MessageService) {
    this.messageService.setMessageStore(msgStore, 'EN');
  }

  listEntityID(): Observable<EntityMeta | {}> {
    return this.http.get<EntityMeta>(this.originalHost + `/api/entity/EntityIDs`).pipe(
      catchError(this.handleError<any>('listEntityID')));
  }

  getEntityMeta(entityID: string): Observable<EntityMeta | {}> {
    return this.http.get<EntityMeta>(this.originalHost + `/api/entity/meta/${entityID}`).pipe(
      catchError(this.handleError<any>('getEntityMeta')));
  }

  searchEntities(queryObject: QueryObject): Observable<any> {
    return this.http.post<any>(this.originalHost + `/api/query`, queryObject, httpOptions).pipe(
      catchError(this.handleError<any>('searchEntities')));
  }

  getEntityInstance(instanceGUID: string): Observable<Entity | any[]> {
    return this.http.get<Entity | any[]>(this.originalHost + `/api/entity/instance/${instanceGUID}`).pipe(
      catchError(this.handleError<any>('getEntityInstance')));
  }

  getRelationMeta(relationID: string): Observable<RelationMeta | {}> {
    return this.http.get<RelationMeta>(this.originalHost + `/api/relation/meta/${relationID}`).pipe(
      catchError(this.handleError<any>('getRelationMeta')));
  }

  getRelationMetaOfEntity(entityID: string): Observable<RelationMeta[]> {
    return this.http.get<RelationMeta[]>(this.originalHost + `/api/relation/meta/entity/${entityID}`).pipe(
      catchError(this.handleError<any>('getRelationMetaOfEntity')));
  }

  createEntityInstance(instance: Entity): Observable<any> {
    return this.http.post<any>(this.originalHost + `/api/entity`, instance, httpOptions).pipe(
      catchError(this.handleError<any>('createEntityInstance')));
  }

  changeEntityInstance(instance: Entity): Observable<any> {
    return this.http.put<any>(this.originalHost + `/api/entity`, instance, httpOptions).pipe(
      catchError(this.handleError<any>('changeEntityInstance')));
  }

  listEntityType(term: string): Observable<EntityType[]> {
    return this.http.get<EntityType[]>(this.originalHost + `/api/model/entity-type/list?term=${term}`).pipe(
      catchError(this.handleError<any>('listEntityType')));
  }

  getEntityTypeDesc(entityID: string): Observable<string | {}> {
    return this.http.get<string>( this.originalHost + `/api/model/entity-type/desc/${entityID}`).pipe(
      catchError(this.handleError<any>('getEntityTypeDesc')));
  }

  saveEntityType(entityType: any): Observable<any> {
    return this.http.post<any>(this.originalHost + `/api/model/entity-type`, entityType, httpOptions).pipe(
      catchError(this.handleError<any>('saveEntityType')));
  }

  listRelation(term: string): Observable<Relation[]> {
    return this.http.get<Relation[]>(this.originalHost + `/api/model/relation/list?term=${term}`).pipe(
      catchError(this.handleError<any>('listRelation')));
  }

  getRelationDesc(relationID: string): Observable<string | {}> {
    return this.http.get<string>( this.originalHost + `/api/model/relation/desc/${relationID}`).pipe(
      catchError(this.handleError<any>('getRelationDesc')));
  }

  saveRelation(relation: any): Observable<any> {
    return this.http.post<any>(this.originalHost + `/api/model/relation`, relation, httpOptions).pipe(
      catchError(this.handleError<any>('saveRelation')));
  }

  listRelationship(term: string): Observable<RelationshipH[]> {
    return this.http.get<RelationshipH[]>(this.originalHost + `/api/model/relationship/list?term=${term}`).pipe(
      catchError(this.handleError<any>('listRelationship')));
  }

  getRelationship(relationshipID: string): Observable<any> {
    return this.http.get<any>(this.originalHost + `/api/model/relationship/${relationshipID}`).pipe(
      catchError(this.handleError<any>('getRelationship')));
  }

  getRelationshipDesc(relationshipID: string): Observable<string | {}> {
    return this.http.get<string>(this.originalHost + `/api/model/relationship/desc/${relationshipID}`).pipe(
      catchError(this.handleError<any>('getRelationshipDesc')));
  }

  saveRelationship(relationship: any): Observable<any> {
    return this.http.post<any>(this.originalHost + `/api/model/relationship`, relationship, httpOptions).pipe(
      catchError(this.handleError<any>('saveRelationship')));
  }

  listRole(term: string): Observable<RoleH[]> {
    return this.http.get<RoleH[]>( this.originalHost + `/api/model/role/list?term=${term}`).pipe(
      catchError(this.handleError<any>('listRole')));
  }

  getRole(roleID: string): Observable<any> {
    return this.http.get<any>( this.originalHost + `/api/model/role/${roleID}`).pipe(
      catchError(this.handleError<any>('getRole')));
  }

  getRoleDesc(roleID: string): Observable<string | {}> {
    return this.http.get<string>( this.originalHost + `/api/model/role/desc/${roleID}`).pipe(
      catchError(this.handleError<any>('getRoleDesc')));
  }

  saveRole(role: any): Observable<any> {
    return this.http.post<any>(this.originalHost + `/api/model/role`, role, httpOptions).pipe(
      catchError(this.handleError<any>('saveRole')));
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      if (error.status === 401) {
        this.messageService.addMessage('EXCEPTION', 'SESSION_EXPIRED', messageType.Exception);
      } else {
        this.messageService.addMessage('EXCEPTION', 'GENERIC', messageType.Exception, operation, error.message);
      }

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
