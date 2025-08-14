'use client';

import { useState, useEffect } from 'react';

interface ImageHuntProps {
  config: {
    tiles: number;
    pattern: number[];
    instruction: string;
    minMs?: number;
    difficulty?: number;
  };
  onSubmit: (answer: number[]) => void;
  onTimeUpdate?: (timeMs: number) => void;
}

export function ImageHunt({ config, onSubmit, onTimeUpdate }: ImageHuntProps) {
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [startTime] = useState(Date.now());
  const [canSubmit, setCanSubmit] = useState(false);

  // Generate grid based on tile count
  const gridSize = Math.ceil(Math.sqrt(config.tiles));
  const totalTiles = gridSize * gridSize;

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      onTimeUpdate?.(elapsed);
      
      // Enable submit after minimum time
      if (config.minMs && elapsed >= config.minMs) {
        setCanSubmit(true);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [startTime, config.minMs, onTimeUpdate]);

  const toggleTile = (index: number) => {
    setSelectedTiles(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleSubmit = () => {
    if (!canSubmit && config.minMs) return;
    onSubmit(selectedTiles);
  };

  // Generate pseudo-random image content based on tile index and difficulty
  const getTileContent = (index: number) => {
    const isTarget = config.pattern.includes(index);
    const difficulty = config.difficulty || 1;
    
    // Simulate different image types based on instruction
    if (config.instruction.toLowerCase().includes('traffic')) {
      return isTarget ? '🚦' : ['🚗', '🏠', '🌳', '🚶'][index % 4];
    } else if (config.instruction.toLowerCase().includes('vehicle')) {
      return isTarget ? '🚗' : ['🏠', '🌳', '🚶', '🐕'][index % 4];
    } else if (config.instruction.toLowerCase().includes('crosswalk')) {
      return isTarget ? '🚶' : ['🚗', '🏠', '🌳', '🚦'][index % 4];
    }
    
    // Default pattern
    return isTarget ? '✓' : ['❌', '○', '△', '□'][index % 4];
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Image Verification</h2>
        <p className="text-gray-600">{config.instruction}</p>
        {config.minMs && !canSubmit && (
          <p className="text-sm text-orange-600 mt-2">
            Please wait a moment before submitting...
          </p>
        )}
      </div>

      <div 
        className="grid gap-2 mb-6 mx-auto max-w-md"
        style={{ 
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          aspectRatio: '1'
        }}
      >
        {Array.from({ length: totalTiles }, (_, index) => (
          <button
            key={index}
            onClick={() => toggleTile(index)}
            className={`
              aspect-square border-2 rounded flex items-center justify-center text-lg
              transition-all duration-200 hover:scale-105
              ${selectedTiles.includes(index)
                ? 'border-blue-500 bg-blue-100 shadow-md'
                : 'border-gray-300 hover:border-gray-400'
              }
              ${index >= config.tiles ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            disabled={index >= config.tiles}
          >
            {index < config.tiles ? getTileContent(index) : ''}
          </button>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500 mb-4">
          Selected: {selectedTiles.length} tile{selectedTiles.length !== 1 ? 's' : ''}
        </p>
        
        <button
          onClick={handleSubmit}
          disabled={(!canSubmit && config.minMs) || selectedTiles.length === 0}
          className={`
            px-6 py-2 rounded font-medium transition-all duration-200
            ${(!canSubmit && config.minMs) || selectedTiles.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
            }
          `}
        >
          Verify Selection
        </button>
      </div>
    </div>
  );
}