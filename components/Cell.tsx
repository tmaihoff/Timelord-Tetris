import React from 'react';
import { TETROMINOES } from '../constants';
import { TetrominoType } from '../types';

interface CellProps {
  type: TetrominoType;
}

const Cell: React.FC<CellProps> = ({ type }) => {
  const color = TETROMINOES[type] ? TETROMINOES[type].color : '0,0,0';
  const isFilled = type !== 0;

  return (
    <div
      className={`w-full h-full aspect-square border-b border-r ${
        isFilled ? 'border-black/20' : 'border-gray-800'
      } relative`}
      style={{
        backgroundColor: isFilled ? `rgba(${color}, 1)` : 'rgba(0,0,0,0.4)',
      }}
    >
        {isFilled && (
            <div className="absolute inset-0 border-t-2 border-l-2 border-white/30 pointer-events-none"></div>
        )}
        {isFilled && (
            <div className="absolute inset-0 border-b-2 border-r-2 border-black/20 pointer-events-none"></div>
        )}
    </div>
  );
};

// React.memo makes sure we only re-render the changed cells
export default React.memo(Cell);