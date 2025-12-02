import { useState, useEffect } from 'react';
import { createStage } from '../utils';
import { Grid, IPlayer, GridCell } from '../types';

export const useStage = (player: IPlayer, resetPlayer: () => void) => {
  const [stage, setStage] = useState<Grid>(createStage());
  const [rowsCleared, setRowsCleared] = useState(0);
  const [animatingRows, setAnimatingRows] = useState<number[]>([]);

  useEffect(() => {
    setRowsCleared(0);

    const updateStage = (prevStage: Grid) => {
      // If we are animating, don't update the stage standard logic
      if (animatingRows.length > 0) {
        return prevStage;
      }

      // 1. Flush the stage from the previous render
      const newStage = prevStage.map((row) =>
        row.map((cell) => (cell[1] === 'clear' ? [0, 'clear'] : cell)) as GridCell[]
      ) as Grid;

      // 2. Draw the tetromino
      player.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            if (
                newStage[y + player.pos.y] &&
                newStage[y + player.pos.y][x + player.pos.x]
            ) {
              newStage[y + player.pos.y][x + player.pos.x] = [
                value,
                `${player.collided ? 'merged' : 'clear'}`,
              ];
            }
          }
        });
      });

      // 3. Check for collision
      if (player.collided) {
        // Check for full rows immediately upon collision
        const fullRows: number[] = [];
        newStage.forEach((row, y) => {
            if (row.findIndex(cell => cell[0] === 0) === -1) {
                fullRows.push(y);
            }
        });

        if (fullRows.length > 0) {
            // If we have full rows, mark them as animating and DO NOT reset player/sweep yet
            setAnimatingRows(fullRows);
            
            // Mark cells as animating for visual effect
            return newStage.map((row, y) => 
                fullRows.includes(y) 
                ? row.map(cell => [cell[0], 'animating']) as GridCell[]
                : row
            ) as Grid;
        }

        // If no rows to clear, just reset
        resetPlayer();
        return newStage;
      }

      return newStage;
    };

    setStage((prev) => updateStage(prev));
  }, [player, resetPlayer]); // Dependent on player

  // Effect to handle the actual clearing after animation
  useEffect(() => {
      if (animatingRows.length > 0) {
          // Wait for Dalek animation (approx 1.5s)
          const timer = setTimeout(() => {
              setStage(prev => {
                  const newStage = prev.reduce((ack, row) => {
                    // Filter out rows that were animating
                    if (row.some(cell => cell[1] === 'animating')) {
                        return ack; // Don't push this row
                    }
                    ack.push(row);
                    return ack;
                  }, [] as Grid);

                  // Add new empty rows at top
                  while(newStage.length < prev.length) {
                      newStage.unshift(new Array(prev[0].length).fill([0, 'clear']));
                  }
                  
                  return newStage;
              });
              
              setRowsCleared(animatingRows.length);
              setAnimatingRows([]);
              resetPlayer();
          }, 1500); // 1.5 second animation duration

          return () => clearTimeout(timer);
      }
  }, [animatingRows, resetPlayer]);

  return { stage, setStage, rowsCleared, animatingRows };
};