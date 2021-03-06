const msgArray = [
  { msgCat: "QUERY",
    msgName: "GENERAL_ERROR",
    msgText: {
      EN: {shortText: "%s", longText: "dummy"}
    }
  },
  { msgCat: "QUERY",
    msgName: "MISS_RELATION",
    msgText: {
      EN: {shortText: "Relation is missing", longText: "dummy"}
    }
  },
  { msgCat: "QUERY",
    msgName: "MISS_ENTITY",
    msgText: {
      EN: {shortText: "Entity is missing", longText: "dummy"}
    }
  },
  { msgCat: "QUERY",
    msgName: "RELATIONSHIP_RELATION_NOT_SUPPORTED",
    msgText: {
      EN: {shortText: "Relationship relation is not supported for generic query!", longText: "dummy"}
    }
  },
  { msgCat: "QUERY",
    msgName: "INVALID_RELATION",
    msgText: {
      EN: {shortText: "Relation %s is invalid", longText: "dummy"}
    }
  },
  { msgCat: "QUERY",
    msgName: "INVALID_PROJECTION",
    msgText: {
      EN: {shortText: "Projection is invalid!", longText: "dummy"}
    }
  },
  { msgCat: "QUERY",
    msgName: "INVALID_FILTER",
    msgText: {
      EN: {shortText: "Filter is invalid, it must be an Array", longText: "dummy"}
    }
  },
  { msgCat: "QUERY",
    msgName: "INVALID_SORT",
    msgText: {
      EN: {shortText: "Sort is invalid!", longText: "dummy"}
    }
  },
  { msgCat: "QUERY",
    msgName: "FILTER_MISS_FIELD_NAME",
    msgText: {
      EN: {shortText: "Field name is missing in the filter", longText: "dummy"}
    }
  },
  { msgCat: "QUERY",
    msgName: "FILTER_MISS_LOW_VALUE",
    msgText: {
      EN: {shortText: "The low value is not given in the filter", longText: "dummy"}
    }
  },
  { msgCat: "QUERY",
    msgName: "INVALID_FIELD",
    msgText: {
      EN: {shortText: "Field %s doesn't exist in relation %s", longText: "dummy"}
    }
  },
  { msgCat: "QUERY",
    msgName: "INVALID_OPERATOR",
    msgText: {
      EN: {shortText: "Operator %s is invalid", longText: "dummy"}
    }
  }
];

module.exports = msgArray;
