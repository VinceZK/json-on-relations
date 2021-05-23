/**
 * Convert the date in local timezone(system/browser timezone) to the UTC timezone.
 * Meanwhile, convert the format between "yyyy-MM-ddThh:mm:ss" and  "yyyy-MM-dd HH:mm:ss".
 */
import {Directive, HostBinding, HostListener, OnInit} from '@angular/core';
import {AbstractControl, NgControl} from '@angular/forms';
@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'input[type=datetime-local]',
})
export class DatetimeDirective implements OnInit {
  @HostBinding('value') localString = '';
  abstractControl: AbstractControl;

  constructor(private control: NgControl) { }

  ngOnInit() {
    this.abstractControl = this.control.control;
    this.localString = this.abstractControl && this.toLocalDateString(this.abstractControl.value);
  }

  private toLocalDateString(utcString: string): string {
    if (!utcString) { return ''; }
    if (utcString.includes('T')) { return utcString; }
    // to support Safari and Firefox, the dateStr format 'yyyy-MM-dd HH:mm:ss' needs to be converted to 'yyyy/MM/dd HH:mm:ss'
    const timeUTC = new Date(utcString.replace(/-/g, '/') + ' UTC');
    if (isNaN(timeUTC.getTime())) {
      return '';
    } else {
      return timeUTC.getFullYear().toString() + '-' + ('0' + (timeUTC.getMonth() + 1)).slice(-2) + '-'
        + ('0' + (timeUTC.getDate())).slice(-2) + 'T' + timeUTC.toTimeString().slice(0, 8);
    }
  }

  private toUTCString(localeString: string): string {
    const localeDate = new Date(localeString);
    return isNaN(localeDate.getTime()) ? '' : localeDate.toISOString().slice(0, 19).replace('T', ' ');
  }

  @HostListener('change', ['$event.target.value']) onDateChange(value: string): void {
    if (value !== this.localString) {
      this.localString = value;
      this.abstractControl.setValue(this.toUTCString(this.localString));
    }
  }
}
