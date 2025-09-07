import { Component, OnInit } from '@angular/core';
import { Field, Point } from 'src/app/models/field.model';
import { FieldComponent } from '../field/field.component';
import { GameState, Player, PlayerMeta } from 'src/app/models/game.model';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  imports: [FieldComponent],
})
export class TableComponent implements OnInit {
  fields: Field[][] = [];
  alert: string = null;

  protected readonly HEIGHT = 8;
  protected readonly WIDTH = 8;

  protected readonly players = [Player.Black, Player.White];
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

  protected restart() {
    this.setToStart();
  }

  protected pass() {
    if (this.gameState.isInProgress() && this.isEnd()) {
      this.updateGameState();
    } else {
      this.setAlert('Nincs lehetőség a passzolásra');
    }
  }

  protected clickField(field: Field) {
    if (!this.gameState.isInProgress() || !field.isPlayerEmpty()) {
      return;
    }

    const rowFieldPairs = this.getValidRowFieldPairs(field);
    const colFieldPairs = this.getValidColFieldPairs(field);
    const mainDiagonalFieldPairs = this.getValidMainDiagonalFieldPairs(field);
    const secondaryDiagonalFieldPairs = this.getValidSecondaryDiagonalFieldPairs(field);
    console.log(rowFieldPairs, colFieldPairs, mainDiagonalFieldPairs, secondaryDiagonalFieldPairs);
    const fields = [...rowFieldPairs, ...colFieldPairs, ...mainDiagonalFieldPairs, ...secondaryDiagonalFieldPairs];

    if (fields.length > 0) {
      this.markBetweenFields(field, fields);
      this.currentPlayer = this.nextPlayer;
      this.checkValues();

      this.gameState.steps = [
        ...this.gameState.steps,
        {
          order: this.gameState.steps.length,
          player: this.currentPlayer,
          cell: field.point,
        },
      ];

      if (this.isEnd()) {
        this.updateGameState();
      }
    }
  }

  private setToStart() {
    const fields: Field[][] = [];
    this.currentPlayer = Player.Black;

    // Generate fields
    for (let i = 0; i < this.HEIGHT; i++) {
      const row: Field[] = [];
      for (let j = 0; j < this.WIDTH; j++) {
        row.push(new Field({ x: i, y: j }));
      }
      fields.push(row);
    }

    // Inital fields
    //assert(HEIGHT === WIDTH);
    //assert(HEIGHT % 2 === 0);
    fields[this.HEIGHT / 2 - 1][this.WIDTH / 2 - 1].player = Player.Black;
    fields[this.HEIGHT / 2 - 1][this.WIDTH / 2].player = Player.White;
    fields[this.HEIGHT / 2][this.WIDTH / 2 - 1].player = Player.White;
    fields[this.HEIGHT / 2][this.WIDTH / 2].player = Player.Black;

    this.fields = fields;

    // Initial scores
    this.gameState.scores[Player.Black] = 2;
    this.gameState.scores[Player.White] = 2;
    this.gameState.steps = [];
  }

  private isEnd(): boolean {
    // Any player has zero score (lost his/her tiles)
    if (Object.entries(this.gameState.scores).some(([_, value]) => value <= 0)) {
      return true;
    }

    const total = Object.entries(this.gameState.scores)
      .map(([_, value]) => value)
      .reduce((a, b) => a + b);

    // All tile has been filled
    if (total === this.HEIGHT * this.WIDTH) {
      return true;
    }

    return !this.mapFields((field) => {
      if (!field.isPlayerEmpty()) {
        return false;
      }

      return (
        this.getValidRowFieldPairs(field).length > 0 ||
        this.getValidColFieldPairs(field).length > 0 ||
        this.getValidMainDiagonalFieldPairs(field).length > 0 ||
        this.getValidSecondaryDiagonalFieldPairs(field).length > 0
      );
    })
      .map((row) => row.some((value) => value))
      .some((value) => value);
  }

  private checkValues(): void {
    let scores: Record<Player, number> = {
      [Player.Black]: 0,
      [Player.White]: 0,
    };

    for (let i = 0; i < this.HEIGHT; i++) {
      for (let j = 0; j < this.WIDTH; j++) {
        if (!this.fields[i][j].isPlayerEmpty()) {
          scores[this.fields[i][j].player]++;
        }
      }
    }

    this.players.forEach((player) => {
      this.gameState.scores[player] = scores[player];
    });
  }

  private getValidRowFieldPairs(field: Field): Field[] {
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

    for (let j = field.point.y + 1; j < this.WIDTH; j++) {
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

  private getValidColFieldPairs(field: Field): Field[] {
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

    for (let i = field.point.x + 1; i < this.HEIGHT; i++) {
      const f = this.fields[i][field.point.y];
      if (f.isPlayer(this.currentPlayer)) {
        bottom = f;
        break;
      } else if (f.isPlayerEmpty()) {
        break;
      }
    }

    return [top, bottom].filter((f) => f !== undefined).filter((f) => this.relativeDistance(field, f) > 1);
  }

  private getValidMainDiagonalFieldPairs(field: Field): Field[] {
    let topLeft: Field | undefined = undefined;
    let i = field.point.x - 1;
    let j = field.point.y - 1;

    while (i >= 0 && j >= 0) {
      const f = this.fields[i][j];

      if (f.isPlayer(this.currentPlayer)) {
        topLeft = f;
        break;
      } else if (f.isPlayerEmpty()) {
        break;
      }

      i--;
      j--;
    }

    let bottomRight: Field | undefined = undefined;
    i = field.point.x + 1;
    j = field.point.y + 1;

    while (i < this.HEIGHT && j < this.WIDTH) {
      const f = this.fields[i][j];

      if (f.isPlayer(this.currentPlayer)) {
        bottomRight = f;
        break;
      } else if (f.isPlayerEmpty()) {
        break;
      }

      i++;
      j++;
    }

    return [topLeft, bottomRight].filter((f) => f !== undefined).filter((f) => this.relativeDistance(field, f) > 1);
  }

  private getValidSecondaryDiagonalFieldPairs(field: Field): Field[] {
    let topRight: Field | undefined = undefined;
    let i = field.point.x - 1;
    let j = field.point.y + 1;

    while (i >= 0 && j < this.WIDTH) {
      const f = this.fields[i][j];

      if (f.isPlayer(this.currentPlayer)) {
        topRight = f;
        break;
      } else if (f.isPlayerEmpty()) {
        break;
      }

      i--;
      j++;
    }

    let bottomLeft: Field | undefined = undefined;
    i = field.point.x + 1;
    j = field.point.y - 1;

    while (i < this.HEIGHT && j >= 0) {
      const f = this.fields[i][j];

      if (f.isPlayer(this.currentPlayer)) {
        bottomLeft = f;
        break;
      } else if (f.isPlayerEmpty()) {
        break;
      }

      i++;
      j--;
    }

    return [topRight, bottomLeft].filter((f) => f !== undefined).filter((f) => this.relativeDistance(field, f) > 1);
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

      if (field.point.x - other.point.x === field.point.y - other.point.y) {
        let i = Math.min(field.point.x, other.point.x);
        let j = Math.min(field.point.y, other.point.y);

        while (i <= Math.max(field.point.x, other.point.x) && j <= Math.max(field.point.y, other.point.y)) {
          this.fields[i][j].player = this.currentPlayer;

          i++;
          j++;
        }
      }

      if (Math.abs(field.point.x - other.point.x) === Math.abs(field.point.y - other.point.y)) {
        let i = Math.min(field.point.x, other.point.x);
        let j = Math.max(field.point.y, other.point.y);

        while (i <= Math.max(field.point.x, other.point.x) && j >= Math.min(field.point.y, other.point.y)) {
          this.fields[i][j].player = this.currentPlayer;

          i++;
          j--;
        }
      }
    });
  }
}
