import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {
  DataDomainH, DataElementH, Entity, EntityMeta, EntityType, QueryObject,
  Relation, RelationMeta, RelationshipH, RoleH, SearchHelpH
} from './entity';
import {catchError} from 'rxjs/operators';
import {MessageService, messageType} from 'ui-message-angular';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class EntityService {
  private originalHost = '';
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

  /**
   * List all entity IDs in the system
   */
  listEntityID(): Observable<string[] | {}> {
    return this.http.get<any>(this.originalHost + `/api/entity/EntityIDs`).pipe(
      catchError(this.handleError<any>('listEntityID')));
  }

  /**
   * List entity IDs by a given role ID
   * @param roleID
   */
  listEntityIDbyRole(roleID: string): Observable<EntityMeta | {}> {
    return this.http.get<any>(this.originalHost + `/api/entity/EntityIDs/${roleID}`).pipe(
      catchError(this.handleError<any>('listEntityIDbyRole')));
  }

  /**
   * Return the entity meta for a given entity ID
   * @param entityID
   */
  getEntityMeta(entityID: string): Observable<EntityMeta | {}> {
    return this.http.get<EntityMeta>(this.originalHost + `/api/entity/meta/${entityID}`).pipe(
      catchError(this.handleError<any>('getEntityMeta')));
  }

  /**
   * Return a list of entity objects according to the description of a given query object
   * @param queryObject
   */
  searchEntities(queryObject: QueryObject): Observable<any> {
    return this.http.post<any>(this.originalHost + `/api/query`, queryObject, httpOptions).pipe(
      catchError(this.handleError<any>('searchEntities')));
  }

  /**
   * Return an entity instance for a given entity instance GUID
   * @param instanceGUID
   */
  getEntityInstance(instanceGUID: string): Observable<Entity | any[]> {
    return this.http.get<Entity | any[]>(this.originalHost + `/api/entity/instance/${instanceGUID}`).pipe(
      catchError(this.handleError<any>('getEntityInstance')));
  }

  /**
   * Return a relation's meta data for a given relation ID
   * @param relationID
   */
  getRelationMeta(relationID: string): Observable<RelationMeta | {}> {
    return this.http.get<RelationMeta>(this.originalHost + `/api/relation/meta/${relationID}`).pipe(
      catchError(this.handleError<any>('getRelationMeta')));
  }

  /**
   * Return all relations' meta data for a given entity ID
   * @param entityID
   */
  getRelationMetaOfEntity(entityID: string): Observable<RelationMeta[]> {
    return this.http.get<RelationMeta[]>(this.originalHost + `/api/relation/meta/entity/${entityID}`).pipe(
      catchError(this.handleError<any>('getRelationMetaOfEntity')));
  }

  /**
   * Create a new entity instance
   * @param instance
   */
  createEntityInstance(instance: Entity): Observable<any> {
    return this.http.post<any>(this.originalHost + `/api/entity`, instance, httpOptions).pipe(
      catchError(this.handleError<any>('createEntityInstance')));
  }

  /**
   * Change an existing entity instance
   * @param instance
   */
  changeEntityInstance(instance: Entity): Observable<any> {
    return this.http.put<any>(this.originalHost + `/api/entity`, instance, httpOptions).pipe(
      catchError(this.handleError<any>('changeEntityInstance')));
  }

  /**
   * Delete an entity instance from a given instance GUID
   * @param instanceGUID
   */
  deleteEntityInstance(instanceGUID: string): Observable<any> {
    return this.http.delete<any>(this.originalHost + `/api/entity/instance/${instanceGUID}`).pipe(
      catchError(this.handleError<any>('deleteEntityInstance')));
  }

  /**
   * Return entity types(IDs) for a given search term
   * @param term
   */
  listEntityType(term: string): Observable<EntityType[]> {
    return this.http.get<EntityType[]>(this.originalHost + `/api/model/entity-types?term=${term}`).pipe(
      catchError(this.handleError<any>('listEntityType')));
  }

  /**
   * Return the description of a given entity type(ID)
   * @param entityID
   */
  getEntityTypeDesc(entityID: string): Observable<string | {}> {
    return this.http.get<string>( this.originalHost + `/api/model/entity-types/${entityID}/desc`).pipe(
      catchError(this.handleError<any>('getEntityTypeDesc')));
  }

  /**
   * Save an entity type after changing or creation
   * @param entityType
   */
  saveEntityType(entityType: any): Observable<any> {
    return this.http.post<any>(this.originalHost + `/api/model/entity-types`, entityType, httpOptions).pipe(
      catchError(this.handleError<any>('saveEntityType')));
  }

  /**
   * Return a list of relations in the system according to the search term
   * @param term
   */
  listRelation(term: string): Observable<Relation[]> {
    return this.http.get<Relation[]>(this.originalHost + `/api/model/relations?term=${term}`).pipe(
      catchError(this.handleError<any>('listRelation')));
  }

  /**
   * Return the description of a given relation ID
   * @param relationID
   */
  getRelationDesc(relationID: string): Observable<string | {}> {
    return this.http.get<string>( this.originalHost + `/api/model/relations/${relationID}/desc`).pipe(
      catchError(this.handleError<any>('getRelationDesc')));
  }

  /**
   * Save a relation after changing or creation
   * @param relation
   */
  saveRelation(relation: any): Observable<any> {
    return this.http.post<any>(this.originalHost + `/api/model/relations`, relation, httpOptions).pipe(
      catchError(this.handleError<any>('saveRelation')));
  }

  /**
   * Return a list of relationships in the system according to the search term
   * @param term
   */
  listRelationship(term: string): Observable<RelationshipH[]> {
    return this.http.get<RelationshipH[]>(this.originalHost + `/api/model/relationships?term=${term}`).pipe(
      catchError(this.handleError<any>('listRelationship')));
  }

  /**
   * Return a relationship definition from a given relationship ID
   * @param relationshipID
   */
  getRelationship(relationshipID: string): Observable<any> {
    return this.http.get<any>(this.originalHost + `/api/model/relationships/${relationshipID}`).pipe(
      catchError(this.handleError<any>('getRelationship')));
  }

  /**
   * Return the description of a given relationship ID
   * @param relationshipID
   */
  getRelationshipDesc(relationshipID: string): Observable<string | {}> {
    return this.http.get<string>(this.originalHost + `/api/model/relationships/${relationshipID}/desc`).pipe(
      catchError(this.handleError<any>('getRelationshipDesc')));
  }

  /**
   * Save a relationship after changing or creation
   * @param relationship
   */
  saveRelationship(relationship: any): Observable<any> {
    return this.http.post<any>(this.originalHost + `/api/model/relationships`, relationship, httpOptions).pipe(
      catchError(this.handleError<any>('saveRelationship')));
  }

  /**
   * Return a list of roles in the system according to the search term
   * @param term
   */
  listRole(term: string): Observable<RoleH[]> {
    return this.http.get<RoleH[]>( this.originalHost + `/api/model/roles?term=${term}`).pipe(
      catchError(this.handleError<any>('listRole')));
  }

  /**
   * Return a role definition from a given role ID
   * @param roleID
   */
  getRole(roleID: string): Observable<any> {
    return this.http.get<any>( this.originalHost + `/api/model/roles/${roleID}`).pipe(
      catchError(this.handleError<any>('getRole')));
  }

  /**
   * Return the description of a given role ID
   * @param roleID
   */
  getRoleDesc(roleID: string): Observable<string | {}> {
    return this.http.get<string>( this.originalHost + `/api/model/roles/${roleID}/desc`).pipe(
      catchError(this.handleError<any>('getRoleDesc')));
  }

  /**
   * Save a role after changing or creation
   * @param role
   */
  saveRole(role: any): Observable<any> {
    return this.http.post<any>(this.originalHost + `/api/model/roles`, role, httpOptions).pipe(
      catchError(this.handleError<any>('saveRole')));
  }

  /**
   * Return a list of data elements in the system according to the search term
   * @param term
   */
  listDataElement(term: string): Observable<DataElementH[]> {
    return this.http.get<DataElementH[]>( this.originalHost + `/api/model/data-elements?term=${term}`).pipe(
      catchError(this.handleError<any>('listDataElement')));
  }

  /**
   * Return a data element definition from a given element ID
   * @param elementID
   */
  getDataElement(elementID: string): Observable<any> {
    return this.http.get<any>( this.originalHost + `/api/model/data-elements/${elementID}`).pipe(
      catchError(this.handleError<any>('getDataElement')));
  }

  /**
   * Return the description of a given data element ID
   * @param elementID
   */
  getDataElementDesc(elementID: string): Observable<string | {}> {
    return this.http.get<string>( this.originalHost + `/api/model/data-elements/${elementID}/desc`).pipe(
      catchError(this.handleError<any>('getDataElementDesc')));
  }

  /**
   * Save a data element after changing or creation
   * @param element
   */
  saveDataElement(element: any): Observable<any> {
    return this.http.post<any>(this.originalHost + `/api/model/data-elements`, element, httpOptions).pipe(
      catchError(this.handleError<any>('saveDataElement')));
  }

  /**
   * Return a list of data domains in the system according to the search term
   * @param term
   */
  listDataDomain(term: string): Observable<DataDomainH[]> {
    return this.http.get<DataDomainH[]>( this.originalHost + `/api/model/data-domains?term=${term}`).pipe(
      catchError(this.handleError<any>('listDataDomain')));
  }

  /**
   * Return a data domain definition from a given domain ID
   * @param domainID
   */
  getDataDomain(domainID: string): Observable<any> {
    return this.http.get<any>( this.originalHost + `/api/model/data-domains/${domainID}`).pipe(
      catchError(this.handleError<any>('getDataDomain')));
  }

  /**
   * Return the description of a given data domain ID
   * @param domainID
   */
  getDataDomainDesc(domainID: string): Observable<string | {}> {
    return this.http.get<string>( this.originalHost + `/api/model/data-domains/${domainID}/desc`).pipe(
      catchError(this.handleError<any>('getDataDomainDesc')));
  }

  /**
   * Save a data domain after changing or creation
   * @param domain
   */
  saveDataDomain(domain: any): Observable<any> {
    return this.http.post<any>(this.originalHost + `/api/model/data-domains`, domain, httpOptions).pipe(
      catchError(this.handleError<any>('saveDataDomain')));
  }

  /**
   * Return a list of search helps in the system according to the search term
   * @param term
   */
  listSearchHelp(term: string): Observable<SearchHelpH[]> {
    return this.http.get<SearchHelpH[]>( this.originalHost + `/api/model/search-helps?term=${term}`).pipe(
      catchError(this.handleError<any>('listSearchHelp')));
  }

  /**
   * Return a search help definition from a given domain ID
   * @param searchHelpID
   */
  getSearchHelp(searchHelpID: string): Observable<any> {
    return this.http.get<any>( this.originalHost + `/api/model/search-helps/${searchHelpID}`).pipe(
      catchError(this.handleError<any>('getSearchHelp')));
  }

  /**
   * Return the description of a given search help ID
   * @param searchHelpID
   */
  getSearchHelpDesc(searchHelpID: string): Observable<string | {}> {
    return this.http.get<string>( this.originalHost + `/api/model/search-helps/${searchHelpID}/desc`).pipe(
      catchError(this.handleError<any>('getSearchHelpDesc')));
  }

  /**
   * Save a search help after changing or creation
   * @param searchHelp
   */
  saveSearchHelp(searchHelp: any): Observable<any> {
    return this.http.post<any>(this.originalHost + `/api/model/search-helps`, searchHelp, httpOptions).pipe(
      catchError(this.handleError<any>('saveSearchHelp')));
  }

  /**
   * Get data element meta
   * @param elementID
   */
  getElementMeta(elementID: string): Observable<any> {
    return this.http.get<string>( this.originalHost + `/api/model/element-meta/${elementID}`).pipe(
      catchError(this.handleError<any>('getElementMeta')));
  }

  /**
   * Return a fake relationship ID before saving
   */
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
