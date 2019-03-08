import { Component, OnInit } from '@angular/core';
import { Field } from 'src/app/models/field.model';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  Fields = [];
  currentUser = 2;
  alert: string = null;
  first = 2;
  second = 2;
  winner = 0;
  game = true;

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

  pass() {
    if (this.game && this.isEnd()) {
      this.game = false;
      this.winner = this.first > this.second ? 1 : this.first === this.second ? 3 : 2;
    }
  }

  isEnd(): boolean {
    if (!this.checkHasField(1)) {
      return true;
    }
    if (!this.checkHasField(2)) {
      return true;
    }
    if (!this.checkHasAvailable()) {
      return true;
    } else {
      let allvalid = true;
      for (let i = 0; i < 8 && allvalid; i++) {
        for (let j = 0; j < 8 && allvalid; j++) {
          if (this.Fields[i][j].owner === 0) {
            let valid = false;
            if (this.checkRow(this.Fields[i][j], false)) {
              valid = true;
            }
            if (this.checkCol(this.Fields[i][j], false)) {
              valid = true;
            }
            if (this.checkMainDiagonal(this.Fields[i][j], false)) {
              valid = true;
            }
            if (this.checkNotMainDiagonal(this.Fields[i][j], false)) {
              valid = true;
            }
            if (valid) {
              allvalid = false;
            }
          }
        }
      }
      if (allvalid) {
        return true;
      }
    }
    return false;
  }

  clickField(Field: Field) {
    if (this.game) {
      console.log(Field);
      console.log(this.currentUser);
      let valid = false;
      if (this.checkRow(Field, true)) {
        valid = true;
      }
      if (this.checkCol(Field, true)) {
        valid = true;
      }
      if (this.checkMainDiagonal(Field, true)) {
        valid = true;
      }
      if (this.checkNotMainDiagonal(Field, true)) {
        valid = true;
      }
      if (valid) {
        this.Fields[Field.x][Field.y].owner = this.currentUser;
        this.currentUser = this.currentUser === 1 ? 2 : 1;
        this.checkValues();
        if (this.isEnd()) {
          this.game = false;
          this.winner = this.first > this.second ? 1 : this.first === this.second ? 3 : 2;
        }
      }
    }
    console.log('---------------------------------');
  }

  checkHasField(player: number): boolean {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.Fields[i][j].owner === player) {
          return true;
        }
      }
    }
    return false;
  }

  checkHasAvailable(): boolean {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.Fields[i][j].owner === 0) {
          return true;
        }
      }
    }
    return false;
  }

  checkValues(): void {
    this.first = 0;
    this.second = 0;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.Fields[i][j].owner === 1) {
          this.first++;
        } else if (this.Fields[i][j].owner === 2) {
          this.second++;
        }
      }
    }
  }

  checkRow(Field: Field, character: boolean) {
    let validLeft;
    let stop = true;
    let ys = [];
    if (Field.y > 1) {
      validLeft = true;
      for (let j = Field.y - 1; j >= 0 && validLeft && stop; j--) {
        switch (this.Fields[Field.x][j].owner) {
          case 0:
            validLeft = false;
            break;
          case this.currentUser:
            console.log(ys);
            if (ys.length > 0) {
              if (character) {
                console.log('Rajz');
                for (let k = 0; k < ys.length; k++) {
                  this.Fields[Field.x][ys[k]].owner = this.currentUser;
                }
              }
              stop = false;
            } else {
              validLeft = false;
            }
            break;
          default:
            ys.push(j);
            if (j === 0) {
              validLeft = false;
            }
            break;
        }
      }
    }
    let validRight;
    ys = [];
    stop = true;
    if (Field.y < 6) {
      validRight = true;
      for (let j = Field.y + 1; j <= 7 && validRight && stop; j++) {
        switch (this.Fields[Field.x][j].owner) {
          case 0:
            validRight = false;
            break;
          case this.currentUser:
            if (ys.length > 0) {
              if (character) {
                console.log('Rajz');
                for (let k = 0; k < ys.length; k++) {
                  this.Fields[Field.x][ys[k]].owner = this.currentUser;
                }
              }
              stop = false;
            } else {
              validRight = false;
            }
            break;
          default:
            ys.push(j);
            if (j === 7) {
              validRight = false;
            }
            break;
        }
      }
    }
    if (validLeft === true || validRight === true) {
      return true;
    }
    return false;
  }

  checkCol(Field: Field, character: boolean) {
    let validTop;
    let stop = true;
    let xs = [];
    if (Field.x > 1) {
      validTop = true;
      for (let i = Field.x - 1; i >= 0 && validTop && stop; i--) {
        switch (this.Fields[i][Field.y].owner) {
          case 0:
            validTop = false;
            break;
          case this.currentUser:
            console.log(xs);
            if (xs.length > 0) {
              if (character) {
                console.log('Rajz');
                for (let k = 0; k < xs.length; k++) {
                  this.Fields[xs[k]][Field.y].owner = this.currentUser;
                }
              }
              stop = false;
            } else {
              validTop = false;
            }
            break;
          default:
            xs.push(i);
            if (i === 0) {
              validTop = false;
            }
            break;
        }
      }
    }
    let validBottom;
    xs = [];
    stop = true;
    if (Field.x < 6) {
      validBottom = true;
      for (let i = Field.x + 1; i <= 7 && validBottom && stop; i++) {
        switch (this.Fields[i][Field.y].owner) {
          case 0:
            validBottom = false;
            break;
          case this.currentUser:
            console.log(xs);
            if (xs.length > 0) {
              if (character) {
                console.log('Rajz');
                for (let k = 0; k < xs.length; k++) {
                  this.Fields[xs[k]][Field.y].owner = this.currentUser;
                }
              }
              stop = false;
            } else {
              validBottom = false;
            }
            break;
          default:
            xs.push(i);
            if (i === 7) {
              validBottom = false;
            }
            break;
        }
      }
    }
    if (validBottom === true || validTop === true) {
      return true;
    }
    return false;
  }

  // A végén ne álljanak be az eredeti érékek a többi check miatt

  checkMainDiagonal(Field: Field, character: boolean): boolean {
    let validRigthBottom;
    let stop = true;
    let x = Field.x - 1;
    let y = Field.y - 1;
    let xs = [];
    let ys = [];
    if (Field.x > 1 && Field.y > 1) {
      validRigthBottom = true;
      while (x !== 0 && y !== 0 && stop && validRigthBottom) {
        console.log('RightBottom', this.Fields[x][y]);
        switch (this.Fields[x][y].owner) {
          case 0:
            validRigthBottom = false;
            break;
          case this.currentUser:
            if (xs.length > 0 && ys.length > 0) {
              if (character) {
                console.log('Rajz');
                for (let k = 0; k < xs.length; k++) {
                  this.Fields[xs[k]][ys[k]].owner = this.currentUser;
                }
              }
              stop = false;
            } else {
              validRigthBottom = false;
            }
            break;
          default:
            xs.push(x);
            ys.push(y);
            if (x === 0 || y === 0) {
              validRigthBottom = false;
            }
            break;
        }
        x--;
        y--;
      }
    }
    let validLeftTop;
    stop = true;
    x = Field.x + 1;
    y = Field.y + 1;
    xs = [];
    ys = [];
    if (Field.x < 6 && Field.y < 6) {
      validLeftTop = true;
      while (x !== 7 && y !== 7 && stop && validLeftTop) {
        console.log('LeftTop', this.Fields[x][y]);
        switch (this.Fields[x][y].owner) {
          case 0:
            validLeftTop = false;
            break;
          case this.currentUser:
            if (xs.length > 0 && ys.length > 0) {
              if (character) {
                console.log('Rajz');
                for (let k = 0; k < xs.length; k++) {
                  this.Fields[xs[k]][ys[k]].owner = this.currentUser;
                }
              }
              stop = false;
            } else {
              validLeftTop = false;
            }
            break;
          default:
            xs.push(x);
            ys.push(y);
            if (x === 7 || y === 7) {
              validLeftTop = false;
            }
            break;
        }
        x++;
        y++;
      }
    }

    if (validRigthBottom === true || validLeftTop === true) {
      return true;
    }
    return false;
  }

  checkNotMainDiagonal(Field: Field, character: boolean): boolean {
    let validLeftBottom;
    let stop = true;
    let x = Field.x + 1;
    let y = Field.y - 1;
    let xs = [];
    let ys = [];
    if (Field.x < 6 && Field.y > 1) {
      validLeftBottom = true;
      while (x !== 7 && y !== 0 && stop && validLeftBottom) {
        console.log('LeftBottom', this.Fields[x][y]);
        switch (this.Fields[x][y].owner) {
          case 0:
            validLeftBottom = false;
            break;
          case this.currentUser:
            if (xs.length > 0 && ys.length > 0) {
              if (character) {
                console.log('Rajz');
                for (let k = 0; k < xs.length; k++) {
                  this.Fields[xs[k]][ys[k]].owner = this.currentUser;
                }
              }
              stop = false;
            } else {
              validLeftBottom = false;
            }
            break;
          default:
            xs.push(x);
            ys.push(y);
            if (x === 7 || y === 0) {
              validLeftBottom = false;
            }
            break;
        }
        x++;
        y--;
      }
    }
    let validRightTop;
    stop = true;
    x = Field.x - 1;
    y = Field.y + 1;
    xs = [];
    ys = [];
    if (Field.x > 1 && Field.y < 6) {
      validRightTop = true;
      while (x !== 7 && y !== 7 && stop && validRightTop) {
        console.log('RightTop', this.Fields[x][y]);
        switch (this.Fields[x][y].owner) {
          case 0:
            validRightTop = false;
            break;
          case this.currentUser:
            if (xs.length > 0 && ys.length > 0) {
              if (character) {
                console.log('Rajz');
                for (let k = 0; k < xs.length; k++) {
                  this.Fields[xs[k]][ys[k]].owner = this.currentUser;
                }
              }
              stop = false;
            } else {
              validRightTop = false;
            }
            break;
          default:
            xs.push(x);
            ys.push(y);
            if (x === 0 || y === 7) {
              validRightTop = false;
            }
            break;
        }
        x--;
        y++;
      }
    }

    if (validRightTop === true || validLeftBottom === true) {
      return true;
    }
    return false;
  }
}
