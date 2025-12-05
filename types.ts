
export type TetrominoType = 0 | 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface ITetromino {
  shape: TetrominoType[][];
  color: string;
}

export type GridCell = [TetrominoType, string]; // [Type, State ('clear' | 'merged' | 'animating')]
export type Grid = GridCell[][];

export interface IPlayer {
  pos: { x: number; y: number };
  tetromino: TetrominoType[][];
  collided: boolean;
}

export interface ITeleport {
    active: boolean;
    x: number;
    yStart: number;
    yEnd: number;
    tetromino: TetrominoType[][];
}
