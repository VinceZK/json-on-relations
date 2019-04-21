// TODO Export these types in packaging
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
  DATA_TYPE: number;
  DATA_LENGTH?: number;
  DECIMAL?: number;
  ORDER?: number;
  PRIMARY_KEY?: boolean;
  AUTO_INCREMENT?: boolean;
}
export class Role {
  ROLE_ID: string;
  ROLE_DESC?: string;
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
  EMPTY: boolean;
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
