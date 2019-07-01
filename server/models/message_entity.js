const msgArray = [
  { msgCat: "ENTITY",
    msgName: "GENERAL_ERROR",
    msgText: {
      EN: {shortText: "'%s'", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "ENTITY_META_NOT_EXIST",
    msgText: {
      EN: {shortText: "The meta data of entity '%s' doesn't exist, or not loaded", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "RELATION_META_NOT_EXIST",
    msgText: {
      EN: {shortText: "The meta data of relation '%s' doesn't exist, or not loaded", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "ENTITY_ID_MISSING",
    msgText: {
      EN: {shortText: "There is no ENTITY_ID provided", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "INSTANCE_GUID_MISSING",
    msgText: {
      EN: {shortText: "There is no INSTANCE_GUID provided", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "ENTITY_NOT_EXIST",
    msgText: {
      EN: {shortText: "Entity '%s' doesn't exist", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "UPDATE_DELETE_NOT_ALLOWED",
    msgText: {
      EN: {shortText: "Update and Delete are not allowed during creating a new instance", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "RELATION_NOT_VALID",
    msgText: {
      EN: {shortText: "Entity '%s' doesn't have relation: '%s'", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "RELATION_NOT_ALLOW_MULTIPLE_VALUE",
    msgText: {
      EN: {shortText: "Relation '%s' doesn't allow multiple values", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "MANDATORY_RELATION_MISSING",
    msgText: {
      EN: {shortText: "Mandatory relation '%s' is missing in Entity '%s", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "ATTRIBUTE_NOT_VALID",
    msgText: {
      EN: {shortText: "Entity: '%s' doesn't have attribute: '%s'", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "ATTRIBUTE_NOT_MULTI_VALUE",
    msgText: {
      EN: {shortText: "Attribute '%s' of entity '%s' doesn't support multiple values", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "RELATIONSHIP_NOT_VALID",
    msgText: {
      EN: {shortText: "Entity '%s' doesn't involve in relationship '%s'", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "ROLE_NOT_VALID",
    msgText: {
      EN: {shortText: "Role '%s' doesn't involve in relationship '%s'", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "INVOLVED_ROLE_NUMBER_INCORRECT",
    msgText: {
      EN: {shortText: "The relationship '%s' involves '%s' roles, however, '%s' roles are given.", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "RELATIONSHIP_ACTION_INVALID",
    msgText: {
      EN: {shortText: "Relationship '%s' action is missing or invalid", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "RELATIONSHIP_UPDATE_REDUNDANCY",
    msgText: {
      EN: {shortText: "Only one update statement is allowed in one request", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "RELATIONSHIP_INSTANCE_GUID_MISSING",
    msgText: {
      EN: {shortText: "You have to provide the relationship instance GUID for updating", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "PARTNER_INSTANCES_MISSING",
    msgText: {
      EN: {shortText: "You have to provide partner instance(s) for a new relationship", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "VALID_TO_BEFORE_VALID_FROM",
    msgText: {
      EN: {shortText: "Valid To '%s' is before Valid From '%s'", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "RELATIONSHIP_EXTEND_BEFORE_CURRENT",
    msgText: {
      EN: {shortText: "You cannot extend a relationship before current time", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "RELATIONSHIP_DELETION_NOT_ALLOWED",
    msgText: {
      EN: {
        shortText: "You cannot delete a time dependent relationship",
        longText: "The relationship '%s1' is time dependent. You can only expire it."}
    }
  },
  { msgCat: "ENTITY",
    msgName: "NEW_RELATIONSHIP_ADD_TO_BEFORE",
    msgText: {
      EN: {shortText: "You cannot add a new relationship before current time", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "RELATIONSHIP_INSTANCE_NOT_EXIST",
    msgText: {
      EN: {shortText: "Relationship '%s' doesn't exist", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "RELATIONSHIP_INSTANCE_OVERLAP",
    msgText: {
      EN: {shortText: "Relationship '%s' has overlaps during inserting", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "FUTURE_RELATIONSHIP",
    msgText: {
      EN: {shortText: "The relationship instance '%s' is in future, thus cannot be expired or extended", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "CHANGE_TO_EXPIRED_RELATIONSHIP",
    msgText: {
      EN: {shortText: "The relationship instance '%s' is already expired, thus not allowed for any changes", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "NO_MIX_OF_CHANGE_ADD_OPERATION",
    msgText: {
      EN: {shortText: "Operation 'add' and Operations 'expire','expend',and 'delete' cannot mix use", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "RELATION_ATTRIBUTE_NOT_EXIST",
    msgText: {
      EN: {shortText: "The attribute '%s' doesn't exist in relation '%s'", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "FOREIGN_KEY_CHECK_ERROR",
    msgText: {
      EN: {shortText: "Foreign key(s) '%s' doesn't exist in relation '%s'", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "ENTITY_INSTANCE_NOT_EXIST",
    msgText: {
      EN: {shortText: "Entity instance '%s' doesn't exist", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "INSTANCE_MARKED_DELETE",
    msgText: {
      EN: {shortText: "Instance '%s' of entity '%s' is marked as deleted, thus cannot be changed", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "INSTANCE_NOT_MARKED_DELETE",
    msgText: {
      EN: {shortText: "Instance '%s' of entity '%s' is not marked as deleted, thus cannot be deleted", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "PRIMARY_KEY_MISSING",
    msgText: {
      EN: {shortText: "Primary key '%s' is missing", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "RELATION_ID_MISSING",
    msgText: {
      EN: {shortText: "Please provide a relation for the ID", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "RELATION_NOT_EXIST",
    msgText: {
      EN: {shortText: "Relation '%s' doesn't exist", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "INSTANCE_NOT_EXIST",
    msgText: {
      EN: {shortText: "Instance '%s' doesn't exist", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "IDENTIFY_ATTRIBUTE_MISSING",
    msgText: {
      EN: {shortText: "There is no attribute provided for instance identification", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "INSTANCE_NOT_IDENTIFIED",
    msgText: {
      EN: {shortText: "Instance can not be identified from the given attributes", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "OVERWRITE_RELATIONSHIPS_NOT_ALLOWED",
    msgText: {
      EN: {shortText: "Relationships of an instance cannot be overwritten", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "RELATIONSHIP_PARTNER_ENTITY_AMBIGUOUS",
    msgText: {
      EN: {shortText: "Partner entity is ambiguous in relationship '%s'", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "RELATIONSHIP_IS_NOT_TIME_DEPENDENT",
    msgText: {
      EN: {shortText: "The relationship '%s' is not time-dependent", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "PERMISSION_MISSING",
    msgText: {
      EN: {shortText: "You don't have permission to access entity type: '%s'", longText: "dummy"}
    }
  }
];

module.exports = msgArray;
