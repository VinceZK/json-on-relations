/**
 * Convert the date object to a string in format "yyyy-MM-ddThh:mm:ss".
 */
import {Directive, EventEmitter, HostBinding, HostListener, Input, Output} from '@angular/core';
@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'input[type=datetime-local]',
})
export class DatetimeDirective {
  @Input() set localDatetime(d: Date) { this.localString = this.toLocalDateString(d); }
  @Output() dateChange: EventEmitter<Date>;
  @HostBinding('value') localString = '';

  constructor() {
    this.dateChange = new EventEmitter();
  }

  private toLocalDateString(timeUTC: Date): string {
    if (!timeUTC) { return ''; }
    if (isNaN(timeUTC.getTime())) {
      return '';
    } else {
      return timeUTC.getFullYear().toString() + '-' + ('0' + (timeUTC.getMonth() + 1)).slice(-2) + '-'
        + ('0' + (timeUTC.getDate())).slice(-2) + 'T' + timeUTC.toTimeString().slice(0, 8);
    }
  }

  @HostListener('change', ['$event.target.value'])
  onDateChange(value: string): void {
    if (value !== this.localString) {
      this.localString = value;
      this.dateChange.emit(new Date(value));
    }
  }
}
