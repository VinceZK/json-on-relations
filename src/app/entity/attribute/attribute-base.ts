export class AttributeBase {
  controlType: string;
  key: string;
  name: string;
  label: string;
  list_label: string;
  relationId: string;
  maxLength?: number;
  step?: string;
  placeholder?: string;
  pattern?: string;
  primaryKey: boolean;
  autoIncrement: boolean;
  dropdownList: DropdownList[] = [];
}

class DropdownList {
  key: string | number;
  value?: string;
}
