import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {Entity, EntityMeta, EntityType, QueryObject, Relation, RelationMeta, RelationshipH, RoleH} from './entity';
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
  private entityUrl = environment.entityUrl;
  private relationUrl = environment.relationUrl;
  private queryUrl = environment.queryUrl;
  private modelUrl = environment.modelUrl;

  constructor(private http: HttpClient,
              private messageService: MessageService) {
    this.messageService.setMessageStore(msgStore, 'EN');
  }

  listEntityID(): Observable<EntityMeta> {
    return this.http.get<EntityMeta>(this.entityUrl + `/EntityIDs`).pipe(
      catchError(this.handleError<any>('listEntityID')));
  }

  getEntityMeta(entityID: string): Observable<any> {
    return this.http.get<any>(this.entityUrl + `/meta/${entityID}`).pipe(
      catchError(this.handleError<any>('getEntityMeta')));
  }

  searchEntities(queryObject: QueryObject): Observable<any> {
    return this.http.post<any>(this.queryUrl, queryObject, httpOptions).pipe(
      catchError(this.handleError<any>('searchEntities')));
  }

  getEntityInstance(instanceGUID: string): Observable<Entity> {
    return this.http.get<Entity>(this.entityUrl + `/instance/${instanceGUID}`).pipe(
      catchError(this.handleError<any>('getEntityInstance')));
  }

  getRelationMeta(relationID: string): Observable<any> {
    return this.http.get<any>(this.relationUrl + `/meta/${relationID}`).pipe(
      catchError(this.handleError<any>('getRelationMeta')));
  }

  getRelationMetaOfEntity(entityID: string): Observable<RelationMeta[]> {
    return this.http.get<RelationMeta[]>(this.relationUrl + `/meta/entity/${entityID}`).pipe(
      catchError(this.handleError<any>('getRelationMetaOfEntity')));
  }

  createEntityInstance(instance: Entity): Observable<any> {
    return this.http.post<any>(this.entityUrl, instance, httpOptions).pipe(
      catchError(this.handleError<any>('createEntityInstance')));
  }

  changeEntityInstance(instance: Entity): Observable<any> {
    return this.http.put<any>(this.entityUrl, instance, httpOptions).pipe(
      catchError(this.handleError<any>('changeEntityInstance')));
  }

  listEntityType(term: string): Observable<EntityType[]> {
    return this.http.get<EntityType[]>(this.modelUrl + `/entity-type/list?term=${term}`).pipe(
      catchError(this.handleError<any>('listEntityType')));
  }

  getEntityTypeDesc(entityID: string): Observable<string> {
    return this.http.get<string>( this.modelUrl + `/entity-type/desc/${entityID}`).pipe(
      catchError(this.handleError<any>('getEntityTypeDesc')));
  }

  saveEntityType(entityType: any): Observable<any> {
    return this.http.post<any>(this.modelUrl + `/entity-type`, entityType, httpOptions).pipe(
      catchError(this.handleError<any>('saveEntityType')));
  }

  listRelation(term: string): Observable<Relation[]> {
    return this.http.get<Relation[]>(this.modelUrl + `/relation/list?term=${term}`).pipe(
      catchError(this.handleError<any>('listRelation')));
  }

  getRelationDesc(relationID: string): Observable<string> {
    return this.http.get<string>( this.modelUrl + `/relation/desc/${relationID}`).pipe(
      catchError(this.handleError<any>('getRelationDesc')));
  }

  saveRelation(relation: any): Observable<any> {
    return this.http.post<any>(this.modelUrl + `/relation`, relation, httpOptions).pipe(
      catchError(this.handleError<any>('saveRelation')));
  }

  listRelationship(term: string): Observable<RelationshipH[]> {
    return this.http.get<RelationshipH[]>( this.modelUrl + `/relationship/list?term=${term}`).pipe(
      catchError(this.handleError<any>('listRelationship')));
  }

  getRelationship(relationshipID: string): Observable<any> {
    return this.http.get<any>( this.modelUrl + `/relationship/${relationshipID}`).pipe(
      catchError(this.handleError<any>('getRelationship')));
  }

  getRelationshipDesc(relationshipID: string): Observable<string> {
    return this.http.get<string>( this.modelUrl + `/relationship/desc/${relationshipID}`).pipe(
      catchError(this.handleError<any>('getRelationshipDesc')));
  }

  saveRelationship(relationship: any): Observable<any> {
    return this.http.post<any>(this.modelUrl + `/relationship`, relationship, httpOptions).pipe(
      catchError(this.handleError<any>('saveRelationship')));
  }

  listRole(term: string): Observable<RoleH[]> {
    return this.http.get<RoleH[]>( this.modelUrl + `/role/list?term=${term}`).pipe(
      catchError(this.handleError<any>('listRole')));
  }

  getRole(roleID: string): Observable<any> {
    return this.http.get<any>( this.modelUrl + `/role/${roleID}`).pipe(
      catchError(this.handleError<any>('getRole')));
  }

  getRoleDesc(roleID: string): Observable<string> {
    return this.http.get<string>( this.modelUrl + `/role/desc/${roleID}`).pipe(
      catchError(this.handleError<any>('getRoleDesc')));
  }

  saveRole(role: any): Observable<any> {
    return this.http.post<any>(this.modelUrl + `/role`, role, httpOptions).pipe(
      catchError(this.handleError<any>('saveRole')));
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      this.messageService.addMessage('EXCEPTION', 'GENERIC', messageType.Exception, operation, error.message);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
