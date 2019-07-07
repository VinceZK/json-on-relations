import {Observable} from 'rxjs';

export class SearchHelp {
  OBJECT_NAME: string; // Business object name, for example, employee
  METHOD: SearchHelpMethod | object[]; // Either the search help method, or an array of plain object.
  BEHAVIOUR: string; // A: Auto-Trigger Search, M: Manual-Trigger Search
  MULTI?: boolean;  // Allow multiple value selection
  FUZZY_SEARCH?: boolean; // Allow fuzzy search
  READ_ONLY: boolean;
  ENTITY_ID?: string;
  RELATION_ID?: string;
  FIELDS: SearchHelpField[];
}

export class SearchHelpField {
  RELATION_ID?: string;
  FIELD_NAME: string;
  FIELD_DESC?: string;
  IMPORT: boolean;
  EXPORT: boolean;
  LIST_POSITION: number;
  FILTER_POSITION: number;
  FILTER_DISP_ONLY?: boolean;
  DEFAULT_VALUE?: any;
}

export type SearchHelpMethod = (searchTerm: any) => Observable<object[]>;
