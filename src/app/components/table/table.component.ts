import { Component, OnInit } from '@angular/core';
import { Field } from 'src/app/models/field.model';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  Fields = [];
  currentUser = 1;
  alert: string = null;

  constructor() {}

  ngOnInit() {
    this.setToStart();
  }

  setToStart() {
    for (let i = 0; i < 8; i++) {
      const fields: Field[] = [];
      for (let j = 0; j < 8; j++) {
        fields.push({
          x: i,
          y: j,
          owner: 0
        } as Field);
      }
      this.Fields.push(fields);
    }
    this.Fields[3][3].owner = 1;
    this.Fields[3][4].owner = 2;
    this.Fields[4][3].owner = 2;
    this.Fields[4][4].owner = 1;
  }

  pass() {}

  clickField(Field: Field) {
    console.log(Field);
    console.log(this.checkRow(Field));
    console.log(this.checkCol(Field));
  }

  checkHasField(): boolean {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.Fields[i][j].owner === this.currentUser) {
          return true;
        }
      }
    }
    return false;
  }

  checkRow(Field: Field): boolean {
    let starty = 0;
    let endy = 0;
    for (let j = 0; j < 8 && starty === 0 && endy === 0; j++) {
      if (
        this.Fields[Field.x][j].owner === this.currentUser &&
        Field.y !== j &&
        Field.y !== j - 1 &&
        Field.y !== j + 1
      ) {
        starty = Field.y > j ? j : Field.y;
        endy = Field.y < j ? j : Field.y;
      }
    }
    if (starty !== 0 && endy !== 0) {
      for (let j = starty + 1; j < endy; j++) {
        if (this.Fields[Field.x][j].owner === 0 || this.Fields[Field.x][j].owner === this.currentUser) {
          return false;
        }
      }
    } else {
      return false;
    }
    this.setRow(Field.x, starty, endy);
    return true;
  }

  setRow(row: number, starty: number, endy: number): void {
    for (let j = starty; j <= endy; j++) {
      this.Fields[row][j].owner = this.currentUser;
    }
  }

  checkCol(Field: Field): boolean {
    let startx = 0;
    let endx = 0;
    for (let i = 0; i < 8 && startx === 0 && endx === 0; i++) {
      if (
        this.Fields[i][Field.y].owner === this.currentUser &&
        Field.x !== i &&
        Field.x !== i - 1 &&
        Field.x !== i + 1
      ) {
        startx = Field.x > i ? i : Field.x;
        endx = Field.x < i ? i : Field.x;
      }
    }
    if (startx !== 0 && endx !== 0) {
      for (let i = startx + 1; i < endx; i++) {
        if (this.Fields[i][Field.y].owner === 0 || this.Fields[i][Field.y].owner === this.currentUser) {
          return false;
        }
      }
    } else {
      return false;
    }
    this.setCol(Field.y, startx, endx);
    return true;
  }
  setCol(col: number, startx: number, endx: number): void {
    for (let i = startx; i <= endx; i++) {
      this.Fields[i][col].owner = this.currentUser;
    }
  }
}
