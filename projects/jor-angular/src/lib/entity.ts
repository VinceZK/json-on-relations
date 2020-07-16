export class Entity {
  ENTITY_ID: string;
  INSTANCE_GUID: string;
  [key: string]: any;
  relationships?: Relationship[];
}
export class Relationship {
  RELATIONSHIP_ID: string;
  SELF_ROLE_ID: string;
  values: RelationshipInstance[];
}
export class RelationshipInstance {
  action?: string;
  RELATIONSHIP_INSTANCE_GUID: string;
  VALID_FROM?: string;
  VALID_TO?: string;
  PARTNER_INSTANCES: PartnerInstance[];
  [key: string]: any;
}
export class PartnerInstance {
  ENTITY_ID: string;
  ROLE_ID: string;
  INSTANCE_GUID: string;
  [key: string]: any;
}
export class PartnerRole {
  ENTITY_ID: string;
  ROLE_ID: string;
}
export class EntityMeta {
  ENTITY_ID: string;
  ENTITY_DESC?: string;
  VERSION_NO: number;
  ROLES: Role[];
}
export class Attribute {
  ATTR_GUID?: string;
  RELATION_ID: string;
  ATTR_NAME: string;
  ATTR_DESC?: string;
  DATA_ELEMENT?: string;
  SEARCH_HELP_ID?: string;
  SEARCH_HELP_EXPORT_FIELD?: string;
  DOMAIN_ID?: string;
  DOMAIN_TYPE?: number;
  REG_EXPR?: string;
  DOMAIN_ENTITY_ID?: string;
  DOMAIN_RELATION_ID?: string;
  LABEL_TEXT?: string;
  LIST_HEADER_TEXT?: string;
  DATA_TYPE: number;
  DATA_LENGTH?: number;
  DECIMAL?: number;
  CAPITAL_ONLY?: boolean;
  UNSIGNED?: boolean;
  ORDER?: number;
  PRIMARY_KEY?: boolean;
  AUTO_INCREMENT?: boolean;
}
export class Role {
  ROLE_ID: string;
  ROLE_DESC?: string;
  CONDITIONAL_ATTR?: string;
  CONDITIONAL_VALUE?: string;
  RELATIONS: RoleRelation[];
  RELATIONSHIPS: RelationshipMeta[];
}
export class RoleRelation {
  RELATION_ID: string;
  RELATION_DESC?: string;
  CARDINALITY: string;
}
export class RelationshipMeta {
  RELATIONSHIP_ID: string;
  RELATIONSHIP_DESC?: string;
  VALID_PERIOD?: number;
  SINGLETON?: boolean;
  CREATE_BY?: string;
  CREATE_TIME?: string;
  LAST_CHANGE_BY?: string;
  LAST_CHANGE_TIME?: string;
  INVOLVES: Involve[];
}
export class Involve {
  ROLE_ID: string;
  ROLE_DESC?: string;
  CARDINALITY: string;
  DIRECTION: string;
}
export class RelationMeta {
  RELATION_ID: string;
  RELATION_DESC?: string;
  VERSION_NO: number;
  ATTRIBUTES: Attribute[];
  ASSOCIATIONS?: Association[];
}
export class Association {
  ASSOCIATION_NAME: string;
  RIGHT_RELATION_ID: string;
  CARDINALITY: string;
  FOREIGN_KEY_CHECK: boolean;
  FIELDS_MAPPING: FieldsMappingPair[];
}
export class FieldsMappingPair {
  LEFT_FIELD: string;
  RIGHT_FIELD: string;
}

export class EntityRelation {
  RELATION_ID: string;
  RELATION_DESC?: string;
  CARDINALITY: string;
  ROLE_ID: string;
  CONDITIONAL_ATTR: string;
  CONDITIONAL_VALUE: string;
  EMPTY: boolean;
  DISABLED: boolean;
  ATTRIBUTES: Attribute[];
}

export class Selection {
  RELATION_ID?: string;
  FIELD_NAME: string;
  OPERATOR: string;
  LOW: string;
  HIGH?: string;
}

export class Projection {
  RELATION_ID?: string;
  FIELD_NAME: string;
  ALIAS?: string;
}

export class QueryObject {
  ENTITY_ID: string;
  RELATION_ID: string;
  PROJECTION?: Array<string|Projection>;
  FILTER?: Selection[];
  SORT?: string[]|Sort[];
}

export class Sort {
  FIELD_NAME: string;
  RELATION_ID?: string;
  ORDER?: string;
}

export class EntityType {
  ENTITY_ID: string;
  ENTITY_DESC?: string;
  VERSION_NO: number;
  CREATE_BY: string;
  CREATE_TIME: string;
  LAST_CHANGE_BY: string;
  LAST_CHANGE_TIME: string;
}

export class Relation {
  RELATION_ID: string;
  RELATION_DESC?: string;
  VERSION_NO: number;
  CREATE_BY: string;
  CREATE_TIME: string;
  LAST_CHANGE_BY: string;
  LAST_CHANGE_TIME: string;
}

export class RelationshipH {
  RELATIONSHIP_ID: string;
  RELATIONSHIP_DESC?: string;
  VALID_PERIOD: number;
  VERSION_NO: number;
  CREATE_BY: string;
  CREATE_TIME: string;
  LAST_CHANGE_BY: string;
  LAST_CHANGE_TIME: string;
}

export class RoleH {
  ROLE_ID: string;
  ROLE_DESC?: string;
  VERSION_NO: number;
  CREATE_BY: string;
  CREATE_TIME: string;
  LAST_CHANGE_BY: string;
  LAST_CHANGE_TIME: string;
}

export class RoleMeta {
  ROLE_ID: string;
  ROLE_DESC?: string;
  CREATE_BY: string;
  CREATE_TIME: string;
  LAST_CHANGE_BY: string;
  LAST_CHANGE_TIME: string;
  RELATIONS?: RoleRelation[];
}

export class DataElementH {
  ELEMENT_ID: string;
  ELEMENT_DESC?: string;
  VERSION_NO: number;
  CREATE_BY: string;
  CREATE_TIME: string;
  LAST_CHANGE_BY: string;
  LAST_CHANGE_TIME: string;
}

export class DataElementMeta {
  ELEMENT_ID: string;
  ELEMENT_DESC?: string;
  LABEL_TEXT?: string;
  LIST_HEADER_TEXT?: string;
  DOMAIN_ID?: string;
  DATA_TYPE: number;
  DATA_LENGTH?: number;
  DECIMAL?: number;
  SEARCH_HELP_ID?: string;
  SEARCH_HELP_EXPORT_FIELD?: string;
  PARAMETER_ID?: string;
  VERSION_NO: number;
  CREATE_BY: string;
  CREATE_TIME: string;
  LAST_CHANGE_BY: string;
  LAST_CHANGE_TIME: string;
}

export class DataDomainH {
  DOMAIN_ID: string;
  DOMAIN_DESC?: string;
  VERSION_NO: number;
  CREATE_BY: string;
  CREATE_TIME: string;
  LAST_CHANGE_BY: string;
  LAST_CHANGE_TIME: string;
}

export class DataDomainMeta {
  DOMAIN_ID: string;
  DOMAIN_DESC?: string;
  DATA_TYPE: number;
  DATA_LENGTH?: number;
  DOMAIN_TYPE: number;
  DECIMAL?: number;
  UNSIGNED?: boolean;
  CAPITAL_ONLY?: boolean;
  REG_EXPR?: string;
  ENTITY_ID?: string;
  RELATION_ID?: string;
  DOMAIN_VALUES?: DataDomainValue[];
  VERSION_NO: number;
  CREATE_BY: string;
  CREATE_TIME: string;
  LAST_CHANGE_BY: string;
  LAST_CHANGE_TIME: string;
}

export class DataDomainValue {
  LOW_VALUE: string;
  LOW_VALUE_TEXT?: string;
  HIGH_VALUE?: string;
}

export class SearchHelpH {
  SEARCH_HELP_ID: string;
  SEARCH_HELP_DESC?: string;
  VERSION_NO: number;
  CREATE_BY: string;
  CREATE_TIME: string;
  LAST_CHANGE_BY: string;
  LAST_CHANGE_TIME: string;
}

export class SearchHelpMeta {
  SEARCH_HELP_ID: string;
  SEARCH_HELP_DESC?: string;
  VERSION_NO: number;
  BEHAVIOUR: string; // A: Auto-Trigger Search, M: Manual-Trigger Search
  ENTITY_ID?: string;
  RELATION_ID?: string;
  MULTI?: boolean;  // Allow multiple value selection
  FUZZY_SEARCH?: boolean; // Allow fuzzy search
  FIELDS: SearchHelpFieldMeta[];
  CREATE_BY: string;
  CREATE_TIME: string;
  LAST_CHANGE_BY: string;
  LAST_CHANGE_TIME: string;
}

export class SearchHelpFieldMeta {
  RELATION_ID?: string;
  FIELD_NAME: string;
  FIELD_DESC?: string;
  LABEL_TEXT?: string;
  LIST_HEADER_TEST?: string;
  IMPORT: boolean;
  EXPORT: boolean;
  IE_FIELD_NAME?: string; // Import or Export field name.
  LIST_POSITION: number;
  FILTER_POSITION: number;
  FILTER_DISP_ONLY?: boolean;
  DEFAULT_VALUE?: any;
}
