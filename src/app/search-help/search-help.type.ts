import {Observable} from 'rxjs';

export class SearchHelp {
  METHOD: SearchHelpMethod | object[]; // 'JOR', service call function reference, or 'DATA'
  BEHAVIOUR: string; // A: Auto-Trigger Search, M: Manual-Trigger Search
  MULTI?: boolean;  // Allow multiple value selection
  FUZZYSEARCH?: boolean; // Allow fuzzy search
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
