/**
 * Convert the date in local timezone(system/browser timezone) to the UTC timezone.
 * The format is unchanged as "yyyy-MM-dd".
 */
import {Directive, HostBinding, HostListener, OnInit} from '@angular/core';
import {AbstractControl, NgControl} from '@angular/forms';
@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'input[type=date]',
})
export class DateDirective implements OnInit {
  @HostBinding('value') localString = '';
  abstractControl: AbstractControl;

  constructor(private control: NgControl) { }

  ngOnInit() {
    this.abstractControl = this.control.control;
    this.localString = this.abstractControl?.value;
  }

  private toUTCString(localeString: string): string {
    const localeDate = new Date(localeString);
    return isNaN(localeDate.getTime()) ? '' : localeDate.toISOString().slice(0, 10);
  }

  @HostListener('change', ['$event.target.value']) onDateChange(value: string): void {
    if (value !== this.localString) {
      this.localString = value;
      this.abstractControl.setValue(this.toUTCString(this.localString));
    }
  }
}
