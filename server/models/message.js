const msgArray = [
  { msgCat: "ENTITY",
    msgName: "GENERAL_ERROR",
    msgText: {
      EN: {shortText: "%s", longText: "dummy"}
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
      EN: {shortText: "Entity %s doesn't exist", longText: "dummy"}
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
      EN: {shortText: "Entity %s doesn't have relation: %s", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "RELATION_NOT_ALLOW_MULTIPLE_VALUE",
    msgText: {
      EN: {shortText: "Relation %s doesn't allow multiple values", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "MANDATORY_RELATION_MISSING",
    msgText: {
      EN: {shortText: "Mandatory relation %s is missing", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "ATTRIBUTE_NOT_VALID",
    msgText: {
      EN: {shortText: "Entity: %s doesn't have attribute: %s", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "ATTRIBUTE_NOT_MULTI_VALUE",
    msgText: {
      EN: {shortText: "Attribute %s of entity %s doesn't support multiple values", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "RELATIONSHIP_NOT_VALID",
    msgText: {
      EN: {shortText: "Entity %s doesn't involve in relationship %s", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "ROLE_NOT_VALID",
    msgText: {
      EN: {shortText: "Role %s doesn't involve in relationship %s", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "RELATIONSHIP_INSTANCE_SINGULAR",
    msgText: {
      EN: {shortText: "Only one instance of role %s can be involved in relationship %s", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "VALID_TO_BEFORE_VALID_FROM",
    msgText: {
      EN: {shortText: "Valid To %s is before Valid From %s", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "RELATION_ATTRIBUTE_NOT_EXIST",
    msgText: {
      EN: {shortText: "The attribute %s doesn't exist in relation %s", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "FOREIGN_KEY_CHECK_ERROR",
    msgText: {
      EN: {shortText: "Foreign key(s) %s doesn't exist in relation %s", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "ENTITY_INSTANCE_NOT_EXIST",
    msgText: {
      EN: {shortText: "Entity instance %s doesn't exist", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "INSTANCE_MARKED_DELETE",
    msgText: {
      EN: {shortText: "Instance %s of entity %s is marked as deleted, thus cannot be changed", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "INSTANCE_NOT_MARKED_DELETE",
    msgText: {
      EN: {shortText: "Instance %s of entity %s is not marked as deleted, thus cannot be deleted", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "PRIMARY_KEY_MISSING",
    msgText: {
      EN: {shortText: "Primary key %s is missing", longText: "dummy"}
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
      EN: {shortText: "Relation %s doesn't exist", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "INSTANCE_NOT_EXIST",
    msgText: {
      EN: {shortText: "Instance %s doesn't exist", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "PRIMARY_KEY_INCOMPLETE",
    msgText: {
      EN: {shortText: "Primary keys are incomplete, missing %s", longText: "dummy"}
    }
  },
  { msgCat: "ENTITY",
    msgName: "INSTANCE_NOT_DERIVE",
    msgText: {
      EN: {shortText: "Instance can not be derived from the given keys of relation %s", longText: "dummy"}
    }
  }
];

module.exports = msgArray;
