import { Field } from './../../models/field.model';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.css'],
})
export class FieldComponent {
  readonly field = input<Field>(null);
  readonly clickFieldEvent = output<Field>();

  clickField() {
    if (this.field().isPlayerEmpty()) {
      this.clickFieldEvent.emit(this.field());
    }
  }
}
