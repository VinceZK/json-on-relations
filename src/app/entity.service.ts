import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {Entity, EntityMeta, RelationMeta} from './entity';
import {catchError} from 'rxjs/operators';
import {MessageService, messageType} from 'ui-message/dist/message';
import {msgStore} from './msgStore';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class EntityService {
  private entityUrl = 'http://localhost:3001/api/entity';
  private relationUrl = 'http://localhost:3001/api/relation';

  constructor(private http: HttpClient,
              private messageService: MessageService) {
    this.messageService.setMessageStore(msgStore, 'EN');
  }

  listEntityID(): Observable<EntityMeta> {
    return this.http.get<EntityMeta>(this.entityUrl + `/EntityIDs`).pipe(
      catchError(this.handleError<any>('listEntityID')));
  }

  getEntityMeta(entityID: string): Observable<EntityMeta> {
    return this.http.get<EntityMeta>(this.entityUrl + `/meta/${entityID}`).pipe(
      catchError(this.handleError<any>('getEntityMeta')));
  }

  getEntityInstance(instanceGUID: string): Observable<Entity> {
    return this.http.get<Entity>(this.entityUrl + `/instance/${instanceGUID}`).pipe(
      catchError(this.handleError<any>('getEntityInstance')));
  }

  // getRelationMeta(relationID: string): Observable<RelationMeta> {
  //   return this.http.get<RelationMeta>(this.relationUrl + `/meta/${relationID}`).pipe(
  //     catchError(this.handleError<any>('getRelationMeta')));
  // }

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
