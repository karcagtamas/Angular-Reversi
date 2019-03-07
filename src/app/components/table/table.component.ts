import { Component, OnInit } from '@angular/core';
import { Field } from 'src/app/models/field.model';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  Fields: Field[] = null;

  constructor() {}

  ngOnInit() {
    this.setToStart();
  }

  setToStart() {}
}
