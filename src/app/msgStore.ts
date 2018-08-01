export const msgStore = [
  { msgCat: 'EXCEPTION',
    msgName: 'GENERIC',
    msgText: {
      EN: {shortText: 'Exception Occurs in Operation: %s',
           longText: '%s2'}
    }
  },
  { msgCat: 'ENTITY',
    msgName: 'ENTITY_SAVED',
    msgText: {
      EN: {shortText: 'Entity instance is saved', longText: ''}
    }
  },
  { msgCat: 'RELATIONSHIP',
    msgName: 'TARGET_INSTANCE_EMPTY',
    msgText: {
      EN: {shortText: 'Target Instance GUID is Mandatory', longText: ''}
    }
  },
  { msgCat: 'RELATIONSHIP',
    msgName: 'VALID_FROM_EMPTY',
    msgText: {
      EN: {shortText: 'Valid From is Mandatory', longText: ''}
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
    msgName: 'INSTANCE_ALREADY_EXIST',
    msgText: {
      EN: {shortText: 'The instance already exists in the relationship', longText: ''}
    }
  }
];
