import { Field } from './../../models/field.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.css'],
})
export class FieldComponent implements OnInit {
  @Input() Field: Field = null;
  @Output() clickFieldEvent = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  clickField() {
    if (this.Field.owner === 0) {
      this.clickFieldEvent.emit(this.Field);
    }
  }
}
