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
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Security Verification</h2>
        </div>
        <p className="text-gray-700 text-lg mb-2">{config.instruction}</p>
        <p className="text-sm text-gray-500">This helps us verify you're not a bot</p>
        {config.minMs && !canSubmit && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⏱️ Please wait a moment before submitting...
            </p>
          </div>
        )}
      </div>

      <div 
        className="grid gap-3 mb-8 mx-auto max-w-lg"
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
              aspect-square border-2 rounded-lg flex items-center justify-center text-xl
              transition-all duration-200 hover:scale-105 hover:shadow-md
              ${selectedTiles.includes(index)
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-blue-300 bg-gray-50'
              }
              ${index >= config.tiles ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
            `}
            disabled={index >= config.tiles}
          >
            {index < config.tiles ? getTileContent(index) : ''}
          </button>
        ))}
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gray-100 rounded-full px-4 py-2">
            <span className="text-sm font-medium text-gray-700">
              Selected: {selectedTiles.length} tile{selectedTiles.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={(!canSubmit && config.minMs) || selectedTiles.length === 0}
          className={`
            px-8 py-3 rounded-lg font-medium transition-all duration-200 text-lg
            ${(!canSubmit && config.minMs) || selectedTiles.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
            }
          `}
        >
          Continue Verification
        </button>
        
        <p className="text-xs text-gray-400 mt-3">
          Your security is our priority
        </p>
      </div>
    </div>
  );
}