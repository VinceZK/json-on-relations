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
  VALID_FROM: string;
  VALID_TO: string;
  PARTNER_INSTANCES: PartnerInstance[];
  [key: string]: any;
}
export class PartnerInstance {
  ENTITY_ID: string;
  ROLE_ID: string;
  INSTANCE_GUID: string;
}
export class EntityMeta {
  ENTITY_ID: string;
  ENTITY_DESC: string;
  VERSION_NO: number;
  ATTRIBUTES: Attribute[];
  ATTRIBUTE_INDICES: ArrtibuteIndex[];
  UNIQUE_ATTRIBUTE_INDICES: UniqueAttributeIndex[];
  ROLES: Role[];
}
export class Attribute {
  ATTR_GUID: string;
  RELATION_ID: string;
  ATTR_NAME: string;
  ATTR_DESC: string;
  DATA_ELEMENT: string;
  DATA_TYPE: number;
  DATA_LENGTH: number;
  PRIMARY_KEY: boolean;
  SEARCHABLE: boolean;
  NOT_NULL: boolean;
  UNIQUE: boolean;
  AUTO_INCREMENT: boolean;
  IS_MULTI_VALUE: boolean;
}
export class ArrtibuteIndex {
  ATTR_NAME: string;
  IDX_TABLE: string;
}
export class UniqueAttributeIndex {
  ATTR_NAME: string;
  IDX_TABLE: string;
  AUTO_INCREMENT: boolean;
}
export class Role {
  ROLE_ID: string;
  ROLE_DESC: string;
  RELATIONS: Relation[];
  RELATIONSHIPS: RelationshipMeta[];
}
export class Relation {
  RELATION_ID: string;
  CARDINALITY: string;
}
export class RelationshipMeta {
  RELATIONSHIP_ID: string;
  RELATIONSHIP_DESC: string;
  VALID_PERIOD: number;
  ATTRIBUTES: Attribute[];
  ATTRIBUTE_INDICES: ArrtibuteIndex[];
  UNIQUE_ATTRIBUTE_INDICES: UniqueAttributeIndex[];
  INVOLVES: Involve[];
}
export class Involve {
  ROLE_ID: string;
  CARDINALITY: string;
}

export class RelationMeta {
  RELATION_ID: string;
  RELATION_DESC: string;
  VERSION_NO: number;
  ATTRIBUTES: Attribute[];
  ASSOCIATIONS: Association[];
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
  CARDINALITY: string;
  ROLE_ID: string;
  EMPTY: boolean;
  ATTRIBUTES: Attribute[];
}

export class Selection {
  fieldName: string;
  operator: string;
  low: string;
  high: string;
}

export class Projection {
  fieldName: string;
  alias: string;
  relation: string;
}

export class QueryObject {
  relation: string;
  projection: Array<string|Projection>;
  filter: Selection[];
}

export class EntityType {
  ENTITY_ID: string;
  ENTITY_DESC: string;
  VERSION_NO: number;
  CREATE_BY: string;
  CREATE_TIME: number;
  LAST_CHANGE_BY: string;
  LAST_CHANGE_TIME: number;
}
