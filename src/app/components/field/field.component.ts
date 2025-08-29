import { Field } from './../../models/field.model';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.css'],
})
export class FieldComponent {
  readonly Field = input<Field>(null);
  readonly clickFieldEvent = output<Field>();

  clickField() {
    const FieldValue = this.Field();
    if (FieldValue.owner === 0) {
      this.clickFieldEvent.emit(FieldValue);
    }
  }
}
