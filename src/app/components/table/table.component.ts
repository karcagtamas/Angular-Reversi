import { Component, OnInit } from '@angular/core';
import { Field, Point } from 'src/app/models/field.model';
import { FieldComponent } from '../field/field.component';
import { GameState, Player, PlayerMeta } from 'src/app/models/game.model';

const HEIGHT = 8;
const WIDTH = 8;

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  imports: [FieldComponent],
})
export class TableComponent implements OnInit {
  fields: Field[][] = [];
  alert: string = null;

  private readonly players = [Player.Black, Player.White];
  protected currentPlayerIndex = 0;
  protected readonly playerMeta = PlayerMeta;

  protected readonly gameState: GameState = new GameState();

  ngOnInit() {
    this.setToStart();
  }

  protected get currentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }

  protected set currentPlayer(player: Player) {
    this.currentPlayerIndex = this.players.indexOf(player);
  }

  protected get nextPlayer(): Player {
    return this.players[(this.currentPlayerIndex + 1) % this.players.length];
  }

  restart() {
    this.setToStart();
  }

  setToStart() {
    const fields: Field[][] = [];
    this.currentPlayer = Player.Black;

    // Generate fields
    for (let i = 0; i < HEIGHT; i++) {
      const row: Field[] = [];
      for (let j = 0; j < WIDTH; j++) {
        row.push(new Field({ x: i, y: j }));
      }
      fields.push(row);
    }

    // Inital fields
    //assert(HEIGHT === WIDTH);
    //assert(HEIGHT % 2 === 0);
    fields[HEIGHT / 2 - 1][WIDTH / 2 - 1].player = Player.Black;
    fields[HEIGHT / 2 - 1][WIDTH / 2].player = Player.White;
    fields[HEIGHT / 2][WIDTH / 2 - 1].player = Player.White;
    fields[HEIGHT / 2][WIDTH / 2].player = Player.Black;

    this.fields = fields;

    // Initial scores
    this.gameState.scores[Player.Black] = 2;
    this.gameState.scores[Player.White] = 2;
  }

  pass() {
    if (this.gameState.isInProgress() && this.isEnd()) {
      this.updateGameState();
    } else {
      this.setAlert('Nincs lehetőség a passzolásra');
    }
  }

  isEnd(): boolean {
    // Any player has zero score (lost his/her tiles)
    if (Object.entries(this.gameState.scores).some(([_, value]) => value <= 0)) {
      return true;
    }

    const total = Object.entries(this.gameState.scores)
      .map(([_, value]) => value)
      .reduce((a, b) => a + b);

    // All tile has been filled
    if (total === HEIGHT * WIDTH) {
      return true;
    }

    return !this.mapFields((field) => {
      if (!field.isPlayerEmpty()) {
        return false;
      }

      return (
        this.getValidRowFieldPairs(field).length > 0 ||
        this.getValidColFieldPairs(field).length > 0 ||
        this.checkMainDiagonal(field, false) ||
        this.checkNotMainDiagonal(field, false)
      );
    })
      .map((row) => row.some((value) => value))
      .some((value) => value);
  }

  clickField(field: Field) {
    if (!this.gameState.isInProgress() || !field.isPlayerEmpty()) {
      return;
    }

    let valid = false;

    const rowFieldPairs = this.getValidRowFieldPairs(field);
    const colFieldPairs = this.getValidColFieldPairs(field);
    const fields = [...rowFieldPairs, ...colFieldPairs];

    valid = fields.length > 0;

    if (this.checkMainDiagonal(field, true)) {
      valid = true;
    }
    if (this.checkNotMainDiagonal(field, true)) {
      valid = true;
    }
    if (valid) {
      this.markBetweenFields(field, fields);
      this.currentPlayer = this.nextPlayer;
      this.checkValues();
      if (this.isEnd()) {
        this.updateGameState();
      }
    }
  }

  checkValues(): void {
    let scores: Record<Player, number> = {
      [Player.Black]: 0,
      [Player.White]: 0,
    };

    for (let i = 0; i < HEIGHT; i++) {
      for (let j = 0; j < WIDTH; j++) {
        if (!this.fields[i][j].isPlayerEmpty()) {
          scores[this.fields[i][j].player]++;
        }
      }
    }

    this.players.forEach((player) => {
      this.gameState.scores[player] = scores[player];
    });
  }

  getValidRowFieldPairs(field: Field): Field[] {
    let left: Field | undefined = undefined;

    for (let j = field.point.y - 1; j >= 0; j--) {
      const f = this.fields[field.point.x][j];
      if (f.isPlayer(this.currentPlayer)) {
        left = f;
        break;
      } else if (f.isPlayerEmpty()) {
        break;
      }
    }

    let right: Field | undefined = undefined;

    for (let j = field.point.y + 1; j < WIDTH; j++) {
      const f = this.fields[field.point.x][j];
      if (f.isPlayer(this.currentPlayer)) {
        right = f;
        break;
      } else if (f.isPlayerEmpty()) {
        break;
      }
    }

    return [left, right].filter((f) => f !== undefined).filter((f) => this.relativeDistance(field, f) > 1);
  }

  getValidColFieldPairs(field: Field): Field[] {
    let top: Field | undefined = undefined;

    for (let i = field.point.x - 1; i >= 0; i--) {
      const f = this.fields[i][field.point.y];
      if (f.isPlayer(this.currentPlayer)) {
        top = f;
        break;
      } else if (f.isPlayerEmpty()) {
        break;
      }
    }

    let bottom: Field | undefined = undefined;

    for (let i = field.point.x + 1; i < HEIGHT; i++) {
      const f = this.fields[i][field.point.x];
      if (f.isPlayer(this.currentPlayer)) {
        bottom = f;
        break;
      } else if (f.isPlayerEmpty()) {
        break;
      }
    }

    return [top, bottom].filter((f) => f !== undefined).filter((f) => this.relativeDistance(field, f) > 1);
  }

  // tslint:disable-next-line: no-shadowed-variable
  checkMainDiagonal(field: Field, character: boolean): boolean {
    let validRigthBottom;
    let stop = true;
    let x = field.point.x - 1;
    let y = field.point.y - 1;
    let xs = [];
    let ys = [];
    if (field.point.x > 1 && field.point.y > 1) {
      validRigthBottom = true;
      while (x !== -1 && y !== -1 && stop && validRigthBottom) {
        if (character) {
          console.log('RightBottom', this.fields[x][y]);
        }
        switch (this.fields[x][y].player) {
          case null:
            validRigthBottom = false;
            break;
          case this.currentPlayer:
            if (xs.length > 0 && ys.length > 0) {
              if (character) {
                for (let k = 0; k < xs.length; k++) {
                  this.fields[xs[k]][ys[k]].player = this.currentPlayer;
                }
              }
              stop = false;
            } else {
              validRigthBottom = false;
            }
            break;
          default:
            if (x === 0 || y === 0) {
              validRigthBottom = false;
            } else {
              xs.push(x);
              ys.push(y);
            }
            break;
        }
        x--;
        y--;
      }
    }
    let validLeftTop;
    stop = true;
    x = field.point.x + 1;
    y = field.point.y + 1;
    xs = [];
    ys = [];
    if (field.point.x < 6 && field.point.y < 6) {
      validLeftTop = true;
      while (x !== 8 && y !== 8 && stop && validLeftTop) {
        if (character) {
          console.log('LeftTop', this.fields[x][y]);
        }
        switch (this.fields[x][y].player) {
          case null:
            validLeftTop = false;
            break;
          case this.currentPlayer:
            if (xs.length > 0 && ys.length > 0) {
              if (character) {
                for (let k = 0; k < xs.length; k++) {
                  this.fields[xs[k]][ys[k]].player = this.currentPlayer;
                }
              }
              stop = false;
            } else {
              validLeftTop = false;
            }
            break;
          default:
            if (x === 7 || y === 7) {
              validLeftTop = false;
            } else {
              xs.push(x);
              ys.push(y);
            }
            break;
        }
        x++;
        y++;
      }
    }
    if (character) {
      console.log('validRightBottom', validRigthBottom);
      console.log('validLeftTop', validLeftTop);
    }
    if (validRigthBottom === true || validLeftTop === true) {
      return true;
    }
    return false;
  }

  checkNotMainDiagonal(field: Field, character: boolean): boolean {
    let validLeftBottom;
    let stop = true;
    let x = field.point.x + 1;
    let y = field.point.y - 1;
    let xs = [];
    let ys = [];
    if (field.point.x < 6 && field.point.y > 1) {
      validLeftBottom = true;
      while (x !== 8 && y !== -1 && stop && validLeftBottom) {
        if (character) {
          console.log('LeftBottom', this.fields[x][y]);
        }
        switch (this.fields[x][y].player) {
          case null:
            validLeftBottom = false;
            break;
          case this.currentPlayer:
            if (xs.length > 0 && ys.length > 0) {
              if (character) {
                for (let k = 0; k < xs.length; k++) {
                  this.fields[xs[k]][ys[k]].player = this.currentPlayer;
                }
              }
              stop = false;
            } else {
              validLeftBottom = false;
            }
            break;
          default:
            if (x === 7 || y === 0) {
              validLeftBottom = false;
            } else {
              xs.push(x);
              ys.push(y);
            }
            break;
        }
        x++;
        y--;
      }
    }
    let validRightTop;
    stop = true;
    x = field.point.x - 1;
    y = field.point.y + 1;
    xs = [];
    ys = [];
    if (field.point.x > 1 && field.point.y < 6) {
      validRightTop = true;
      while (x !== 8 && y !== 8 && stop && validRightTop) {
        if (character) {
          console.log('RightTop', this.fields[x][y]);
        }
        switch (this.fields[x][y].player) {
          case null:
            validRightTop = false;
            break;
          case this.currentPlayer:
            if (xs.length > 0 && ys.length > 0) {
              if (character) {
                for (let k = 0; k < xs.length; k++) {
                  this.fields[xs[k]][ys[k]].player = this.currentPlayer;
                }
              }
              stop = false;
            } else {
              validRightTop = false;
            }
            break;
          default:
            if (x === 0 || y === 7) {
              validRightTop = false;
            } else {
              xs.push(x);
              ys.push(y);
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

  private updateGameState(): void {
    let maximum = 0;
    for (const player of this.players) {
      const score = this.gameState.scores[player];

      if (score > maximum) {
        maximum = score;
      }
    }

    const players = this.players.filter((player) => {
      return maximum === this.gameState.scores[player];
    });

    if (players.length === 0) {
      this.gameState.progress = 'progressing';
    } else if (players.length === 1) {
      this.gameState.progress = players[0];
    } else {
      this.gameState.progress = 'draw';
    }
  }

  private setAlert(message: string): void {
    this.alert = message;
    setTimeout(() => (this.alert = ''), 3000);
  }

  private mapFields<T>(lambda: (field: Field) => T): T[][] {
    return this.fields.map((row) => {
      return row.map((field) => lambda(field));
    });
  }

  private relativeDistance(fieldA: Field, fieldB: Field): number {
    return Math.max(Math.abs(fieldA.point.x - fieldB.point.x), Math.abs(fieldA.point.y - fieldB.point.y));
  }

  private markBetweenFields(field: Field, others: Field[]) {
    others.forEach((other) => {
      if (field.point.x === other.point.x) {
        for (let j = Math.min(field.point.y, other.point.y); j <= Math.max(field.point.y, other.point.y); j++) {
          this.fields[field.point.x][j].player = this.currentPlayer;
        }
      }

      if (field.point.y === other.point.y) {
        for (let i = Math.min(field.point.x, other.point.x); i <= Math.max(field.point.x, other.point.x); i++) {
          this.fields[i][field.point.y].player = this.currentPlayer;
        }
      }
    });
  }
}
