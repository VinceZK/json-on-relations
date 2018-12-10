import {AttributeBase} from './attribute-base';

export class AttributeText extends AttributeBase<string> {
  controlType = 'text';
  type: string;

  constructor(options: {} = {}) {
    super(options);
    this.type = options['type'] || '';
  }
}
