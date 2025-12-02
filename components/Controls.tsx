import React from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, RotateCw, ChevronsDown } from 'lucide-react';

interface ControlsProps {
    move: (dir: number) => void;
    rotate: () => void;
    drop: () => void;
    hardDrop: () => void;
}

const Controls: React.FC<ControlsProps> = ({ move, rotate, drop, hardDrop }) => {
    return (
        <div className="grid grid-cols-3 gap-2 mt-6 w-full max-w-[280px] sm:hidden">
            {/* Row 1 */}
            <div className="col-start-2">
                <button
                    className="w-full aspect-square bg-gray-800 rounded-lg active:bg-gray-700 flex items-center justify-center border-b-4 border-gray-950 active:border-b-0 active:translate-y-1 transition-all"
                    onClick={rotate}
                    aria-label="Rotate"
                >
                    <RotateCw className="text-white w-8 h-8" />
                </button>
            </div>

            {/* Row 2 */}
            <div className="col-start-1">
                <button
                    className="w-full aspect-square bg-gray-800 rounded-lg active:bg-gray-700 flex items-center justify-center border-b-4 border-gray-950 active:border-b-0 active:translate-y-1 transition-all"
                    onClick={() => move(-1)}
                    aria-label="Left"
                >
                    <ArrowLeft className="text-white w-8 h-8" />
                </button>
            </div>
            
            <div className="col-start-2">
                <button
                    className="w-full aspect-square bg-gray-800 rounded-lg active:bg-gray-700 flex items-center justify-center border-b-4 border-gray-950 active:border-b-0 active:translate-y-1 transition-all"
                    onClick={drop}
                    aria-label="Soft Drop"
                >
                    <ArrowDown className="text-white w-8 h-8" />
                </button>
            </div>

            <div className="col-start-3">
                <button
                    className="w-full aspect-square bg-gray-800 rounded-lg active:bg-gray-700 flex items-center justify-center border-b-4 border-gray-950 active:border-b-0 active:translate-y-1 transition-all"
                    onClick={() => move(1)}
                    aria-label="Right"
                >
                    <ArrowRight className="text-white w-8 h-8" />
                </button>
            </div>

             {/* Row 3 - Spacebar equivalent */}
             <div className="col-span-3 mt-2">
                 <button
                    className="w-full h-16 bg-red-900/80 rounded-lg active:bg-red-900 flex items-center justify-center border-b-4 border-red-950 active:border-b-0 active:translate-y-1 transition-all"
                    onClick={hardDrop}
                    aria-label="Hard Drop"
                >
                    <ChevronsDown className="text-red-100 w-8 h-8" />
                </button>
             </div>
        </div>
    );
};

export default Controls;