export const msgStore = [
  { msgCat: 'EXCEPTION',
    msgName: 'GENERIC',
    msgText: {
      EN: {shortText: 'Exception Occurs in Operation: %s',
           longText: '%s2'}
    }
  },
  { msgCat: 'EXCEPTION',
    msgName: 'SESSION_EXPIRED',
    msgText: {
      EN: {shortText: 'Your session is expired',
        longText: 'Your session is expired, please <a href="/logon">re-logon</a>'}
    }
  },
  { msgCat: 'ENTITY',
    msgName: 'NO_CHANGE',
    msgText: {
      EN: {shortText: 'No Change is made, nothing is saved!', longText: ''}
    }
  },
  { msgCat: 'ENTITY',
    msgName: 'HAS_ERRORS',
    msgText: {
      EN: {shortText: 'The form has errors, please check!', longText: ''}
    }
  },
  { msgCat: 'ENTITY',
    msgName: 'ENTITY_SAVED',
    msgText: {
      EN: {shortText: 'Entity instance is saved!', longText: ''}
    }
  },
  { msgCat: 'ENTITY',
    msgName: 'ENTITY_DELETED',
    msgText: {
      EN: {shortText: 'Entity instance is deleted!', longText: ''}
    }
  },
  { msgCat: 'RELATIONSHIP',
    msgName: 'PARTNER_ENTITY_ID_MISSING',
    msgText: {
      EN: {shortText: 'Partner Entity ID is Missing', longText: ''}
    }
  },
  { msgCat: 'RELATIONSHIP',
    msgName: 'PARTNER_INSTANCE_GUID_MISSING',
    msgText: {
      EN: {shortText: 'Partner Instance GUID is Missing', longText: ''}
    }
  },
  { msgCat: 'RELATIONSHIP',
    msgName: 'VALID_TO_EMPTY',
    msgText: {
      EN: {shortText: 'Valid To is Mandatory', longText: ''}
    }
  },
  { msgCat: 'RELATIONSHIP',
    msgName: 'VALID_FROM_AFTER_VALID_TO',
    msgText: {
      EN: {shortText: 'Valid From time must be before Valid To', longText: ''}
    }
  },
  { msgCat: 'RELATIONSHIP',
    msgName: 'MANDATORY_ATTRIBUTE_MISSING',
    msgText: {
      EN: {shortText: 'Mandatory attribute must be given values', longText: ''}
    }
  },
  { msgCat: 'RELATIONSHIP',
    msgName: 'RELATIONSHIP_MANDATORY',
    msgText: {
      EN: {shortText: 'Relationship is mandatory', longText: ''}
    }
  },
  { msgCat: 'RELATIONSHIP',
    msgName: 'RELATIONSHIP_ALREADY_EXISTS',
    msgText: {
      EN: {shortText: 'Relationship %s already exists!', longText: ''}
    }
  },
  { msgCat: 'MODEL',
    msgName: 'NO_CHANGE',
    msgText: {
      EN: {shortText: 'No Change is made, nothing is saved!', longText: ''}
    }
  },
  { msgCat: 'MODEL',
    msgName: 'INVALID_DATA',
    msgText: {
      EN: {shortText: 'Data is invalid, please check!', longText: ''}
    }
  },
  { msgCat: 'MODEL',
    msgName: 'ENTITY_ID_MISSING',
    msgText: {
      EN: {shortText: 'Entity Type ID is missing', longText: ''}
    }
  },
  { msgCat: 'MODEL',
    msgName: 'ENTITY_TYPE_SAVED',
    msgText: {
      EN: {shortText: 'Entity Type "%s" is saved', longText: ''}
    }
  },
  { msgCat: 'MODEL',
    msgName: 'ROLE_SAVED',
    msgText: {
      EN: {shortText: 'Role "%s" is saved', longText: ''}
    }
  },
  { msgCat: 'MODEL',
    msgName: 'RELATION_ID_MISSING',
    msgText: {
      EN: {shortText: 'Relation ID is missing', longText: ''}
    }
  },
  { msgCat: 'MODEL',
    msgName: 'RELATION_PRIMARY_KEY_MISSING',
    msgText: {
      EN: {shortText: 'Relation must have at least one attribute as the primary key', longText: ''}
    }
  },
  { msgCat: 'MODEL',
    msgName: 'MISS_RELATION_ASSOCIATION_FIELD_MAPPING',
    msgText: {
      EN: {shortText: 'There are no fields-mappings defined for association \'%s\'', longText: ''}
    }
  },
  { msgCat: 'MODEL',
    msgName: 'RELATION_SAVED',
    msgText: {
      EN: {shortText: 'Relation "%s" is saved', longText: ''}
    }
  },
  { msgCat: 'MODEL',
    msgName: 'RELATIONSHIP_SAVED',
    msgText: {
      EN: {shortText: 'Relationship "%s" is saved', longText: ''}
    }
  },
  { msgCat: 'MODEL',
    msgName: 'RELATIONSHIP_LACK_INVOLVED_ROLES',
    msgText: {
      EN: {shortText: 'A relationship must at least have 2 involved roles', longText: ''}
    }
  },
  { msgCat: 'MODEL',
    msgName: 'DATA_ELEMENT_SAVED',
    msgText: {
      EN: {shortText: 'Data element "%s" is saved', longText: ''}
    }
  },
  { msgCat: 'MODEL',
    msgName: 'DATA_DOMAIN_SAVED',
    msgText: {
      EN: {shortText: 'Data domain "%s" is saved', longText: ''}
    }
  },
  { msgCat: 'MODEL',
    msgName: 'MINIMUM_ONE_DOMAIN_VALUE',
    msgText: {
      EN: {shortText: 'At least one domain value is needed!', longText: ''}
    }
  },
  { msgCat: 'MODEL',
    msgName: 'SEARCH_HELP_SAVED',
    msgText: {
      EN: {shortText: 'Search Help "%s" is saved', longText: ''}
    }
  },
  { msgCat: 'MODEL',
    msgName: 'MINIMUM_ONE_SEARCH_FIELD',
    msgText: {
      EN: {shortText: 'At least one search field is needed!', longText: ''}
    }
  },
  { msgCat: 'MODEL',
    msgName: 'UNSAVED_NEW',
    msgText: {
      EN: {shortText: 'There is a unsaved new object existing, please save it first, then create another.', longText: ''}
    }
  }
];
