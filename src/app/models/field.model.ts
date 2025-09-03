import { Player } from './game.model';

export type Point = {
  x: number;
  y: number;
};

export class Field {
  player: Player | null = null;
  point: Point;

  constructor(point: Point) {
    this.point = point;
    this.player = null;
  }

  isPlayer(player: Player): boolean {
    return this.player !== null && this.player === player;
  }

  isPlayerEmpty(): boolean {
    return this.player === null;
  }
}
