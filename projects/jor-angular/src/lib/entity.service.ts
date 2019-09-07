import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {DataDomainH, DataElementH, Entity, EntityMeta, EntityType, QueryObject, Relation, RelationMeta, RelationshipH, RoleH} from './entity';
import {catchError} from 'rxjs/operators';
import {MessageService, messageType} from 'ui-message-angular';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class EntityService {
  private originalHost: string;
  private fakeUUIDs = [];

  constructor(private http: HttpClient,
              private messageService: MessageService) {
    this.messageService.setMessageStore([
      { msgCat: 'EXCEPTION', msgName: 'GENERIC',
        msgText: { EN: {shortText: 'Exception Occurs in Operation: %s', longText: '%s2'}}},
      { msgCat: 'EXCEPTION', msgName: 'SESSION_EXPIRED',
        msgText: { EN: {shortText: 'Your session is expired',
            longText: 'Your session is expired, please <a href="/logon">re-logon</a>'}}}], 'EN');
  }

  setOriginalHost(host: string) {
    this.originalHost = host;
  }

  setMessageStore(msgStore: any, language: string) {
    this.messageService.setMessageStore(msgStore, language);
  }

  listEntityID(): Observable<string[] | {}> {
    return this.http.get<any>(this.originalHost + `/api/entity/EntityIDs`).pipe(
      catchError(this.handleError<any>('listEntityID')));
  }

  listEntityIDbyRole(roleID: string): Observable<EntityMeta | {}> {
    return this.http.get<any>(this.originalHost + `/api/entity/EntityIDs/${roleID}`).pipe(
      catchError(this.handleError<any>('listEntityIDbyRole')));
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

  deleteEntityInstance(instanceGUID: string): Observable<any> {
    return this.http.delete<any>(this.originalHost + `/api/entity/instance/${instanceGUID}`).pipe(
      catchError(this.handleError<any>('deleteEntityInstance')));
  }

  listEntityType(term: string): Observable<EntityType[]> {
    return this.http.get<EntityType[]>(this.originalHost + `/api/model/entity-types?term=${term}`).pipe(
      catchError(this.handleError<any>('listEntityType')));
  }

  getEntityTypeDesc(entityID: string): Observable<string | {}> {
    return this.http.get<string>( this.originalHost + `/api/model/entity-types/${entityID}/desc`).pipe(
      catchError(this.handleError<any>('getEntityTypeDesc')));
  }

  saveEntityType(entityType: any): Observable<any> {
    return this.http.post<any>(this.originalHost + `/api/model/entity-types`, entityType, httpOptions).pipe(
      catchError(this.handleError<any>('saveEntityType')));
  }

  listRelation(term: string): Observable<Relation[]> {
    return this.http.get<Relation[]>(this.originalHost + `/api/model/relations?term=${term}`).pipe(
      catchError(this.handleError<any>('listRelation')));
  }

  getRelationDesc(relationID: string): Observable<string | {}> {
    return this.http.get<string>( this.originalHost + `/api/model/relations/${relationID}/desc`).pipe(
      catchError(this.handleError<any>('getRelationDesc')));
  }

  saveRelation(relation: any): Observable<any> {
    return this.http.post<any>(this.originalHost + `/api/model/relations`, relation, httpOptions).pipe(
      catchError(this.handleError<any>('saveRelation')));
  }

  listRelationship(term: string): Observable<RelationshipH[]> {
    return this.http.get<RelationshipH[]>(this.originalHost + `/api/model/relationships?term=${term}`).pipe(
      catchError(this.handleError<any>('listRelationship')));
  }

  getRelationship(relationshipID: string): Observable<any> {
    return this.http.get<any>(this.originalHost + `/api/model/relationships/${relationshipID}`).pipe(
      catchError(this.handleError<any>('getRelationship')));
  }

  getRelationshipDesc(relationshipID: string): Observable<string | {}> {
    return this.http.get<string>(this.originalHost + `/api/model/relationships/${relationshipID}/desc`).pipe(
      catchError(this.handleError<any>('getRelationshipDesc')));
  }

  saveRelationship(relationship: any): Observable<any> {
    return this.http.post<any>(this.originalHost + `/api/model/relationships`, relationship, httpOptions).pipe(
      catchError(this.handleError<any>('saveRelationship')));
  }

  listRole(term: string): Observable<RoleH[]> {
    return this.http.get<RoleH[]>( this.originalHost + `/api/model/roles?term=${term}`).pipe(
      catchError(this.handleError<any>('listRole')));
  }

  getRole(roleID: string): Observable<any> {
    return this.http.get<any>( this.originalHost + `/api/model/roles/${roleID}`).pipe(
      catchError(this.handleError<any>('getRole')));
  }

  getRoleDesc(roleID: string): Observable<string | {}> {
    return this.http.get<string>( this.originalHost + `/api/model/roles/${roleID}/desc`).pipe(
      catchError(this.handleError<any>('getRoleDesc')));
  }

  saveRole(role: any): Observable<any> {
    return this.http.post<any>(this.originalHost + `/api/model/roles`, role, httpOptions).pipe(
      catchError(this.handleError<any>('saveRole')));
  }

  listDataElement(term: string): Observable<DataElementH[]> {
    return this.http.get<RoleH[]>( this.originalHost + `/api/model/data-elements?term=${term}`).pipe(
      catchError(this.handleError<any>('listDataElement')));
  }

  getDataElement(elementID: string): Observable<any> {
    return this.http.get<any>( this.originalHost + `/api/model/data-elements/${elementID}`).pipe(
      catchError(this.handleError<any>('getDataElement')));
  }

  getDataElementDesc(elementID: string): Observable<string | {}> {
    return this.http.get<string>( this.originalHost + `/api/model/data-elements/${elementID}/desc`).pipe(
      catchError(this.handleError<any>('getDataElementDesc')));
  }

  saveDataElement(element: any): Observable<any> {
    return this.http.post<any>(this.originalHost + `/api/model/data-elements`, element, httpOptions).pipe(
      catchError(this.handleError<any>('saveDataElement')));
  }

  listDataDomain(term: string): Observable<DataDomainH[]> {
    return this.http.get<RoleH[]>( this.originalHost + `/api/model/data-domains?term=${term}`).pipe(
      catchError(this.handleError<any>('listDataDomain')));
  }

  getDataDomain(domainID: string): Observable<any> {
    return this.http.get<any>( this.originalHost + `/api/model/data-domains/${domainID}`).pipe(
      catchError(this.handleError<any>('getDataDomain')));
  }

  getDataDomainDesc(domainID: string): Observable<string | {}> {
    return this.http.get<string>( this.originalHost + `/api/model/data-domains/${domainID}/desc`).pipe(
      catchError(this.handleError<any>('getDataDomainDesc')));
  }

  saveDataDomain(domain: any): Observable<any> {
    return this.http.post<any>(this.originalHost + `/api/model/data-domains`, domain, httpOptions).pipe(
      catchError(this.handleError<any>('saveDataDomain')));
  }

  generateFakeRelationshipUUID(): string {
    const nextPosition = this.fakeUUIDs.length + 1;
    const fakeUUID = 'NewRelationship_' + nextPosition;
    this.fakeUUIDs.push(fakeUUID);
    return fakeUUID;
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
