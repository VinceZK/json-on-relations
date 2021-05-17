export class AttributeBase {
  controlType: string;
  key: string;
  name: string;
  label: string;
  list_label: string;
  relationId: string;
  maxLength?: number;
  step?: string;
  domainId?: string;
  placeholder?: string;
  pattern?: string;
  domainEntityId?: string;
  domainRelationId?: string;
  searchHelpId?: string;
  searchHelpExportField?: string;
  primaryKey: boolean;
  autoIncrement: boolean;
  dropdownList: DropdownList[] = [];
  rows: number;
}

class DropdownList {
  key: string | number;
  value?: string;
}
