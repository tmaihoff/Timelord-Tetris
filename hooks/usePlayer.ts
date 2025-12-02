import { useState, useCallback } from 'react';
import { TETROMINOES, randomTetromino, STAGE_WIDTH } from '../constants';
import { checkCollision } from '../utils';
import { Grid, IPlayer, TetrominoType } from '../types';

export const usePlayer = () => {
  const [player, setPlayer] = useState<IPlayer>({
    pos: { x: 0, y: 0 },
    tetromino: TETROMINOES[0].shape,
    collided: false,
  });

  const rotate = (matrix: (TetrominoType | 0)[][], dir: number) => {
    // Transpose matrix
    const transposed = matrix.map((_, index) =>
      matrix.map((col) => col[index])
    );
    
    // Rotate
    if (dir > 0) {
        // Clockwise: Reverse each row
        return transposed.map((row) => row.reverse());
    } else {
        // Counter-Clockwise: Reverse the array of rows
        return transposed.reverse();
    }
  };

  const playerRotate = (stage: Grid, dir: number) => {
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

    // Wall kick (basic)
    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.tetromino[0].length) {
        // Failed to rotate
        clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, -dir); // Rotate back
        clonedPlayer.pos.x = pos;
        return;
      }
    }
    setPlayer(clonedPlayer);
  };

  const updatePlayerPos = ({ x, y, collided }: { x: number; y: number; collided: boolean }) => {
    setPlayer((prev) => ({
      ...prev,
      pos: { x: (prev.pos.x += x), y: (prev.pos.y += y) },
      collided,
    }));
  };

  const resetPlayer = useCallback(() => {
    setPlayer({
      pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
      tetromino: randomTetromino().shape,
      collided: false,
    });
  }, []);

  return { player, updatePlayerPos, resetPlayer, playerRotate, setPlayer };
};