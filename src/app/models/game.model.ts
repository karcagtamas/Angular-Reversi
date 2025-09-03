export enum Player {
  Black,
  White,
}

export const PlayerMeta: Record<Player, { name: string }> = {
  [Player.Black]: {
    name: 'FEKETE',
  },
  [Player.White]: {
    name: 'FEHÉR',
  },
};

export class GameState {
  progress: 'progressing' | 'draw' | Player;
  scores: Record<Player, number>;

  constructor() {
    this.progress = 'progressing';
    this.scores = {
      [Player.Black]: 0,
      [Player.White]: 0,
    };
  }

  isInProgress(): boolean {
    return this.progress === 'progressing';
  }
}
