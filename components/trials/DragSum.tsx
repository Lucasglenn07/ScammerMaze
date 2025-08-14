'use client';

import { useState, useEffect, useRef } from 'react';

interface DragSumProps {
  config: {
    target: number;
    exactly?: number;
    items: number[];
    instruction: string;
    difficulty?: number;
  };
  onSubmit: (answer: { selectedItems: number[]; sum: number }) => void;
  onTimeUpdate?: (timeMs: number) => void;
}

export function DragSum({ config, onSubmit, onTimeUpdate }: DragSumProps) {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [startTime] = useState(Date.now());
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const currentSum = selectedItems.reduce((sum, item) => sum + item, 0);

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      onTimeUpdate?.(elapsed);
    }, 100);

    return () => clearInterval(timer);
  }, [startTime, onTimeUpdate]);

  const handleDragStart = (item: number) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedItem !== null) {
      if (!selectedItems.includes(draggedItem)) {
        setSelectedItems(prev => [...prev, draggedItem]);
      }
      setDraggedItem(null);
    }
  };

  const removeItem = (item: number) => {
    setSelectedItems(prev => prev.filter(i => i !== item));
  };

  const handleSubmit = () => {
    onSubmit({
      selectedItems,
      sum: currentSum
    });
  };

  const isValidSelection = () => {
    if (config.exactly && selectedItems.length !== config.exactly) {
      return false;
    }
    return currentSum === config.target && selectedItems.length > 0;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Number Combination</h2>
        <p className="text-gray-600">{config.instruction}</p>
        <p className="text-lg font-medium mt-2">
          Target: <span className="text-blue-600">{config.target}</span>
          {config.exactly && (
            <span className="text-sm text-gray-500 ml-2">
              (exactly {config.exactly} items)
            </span>
          )}
        </p>
      </div>

      {/* Available Items */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Available Numbers:</h3>
        <div className="flex flex-wrap gap-2">
          {config.items.map((item, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(item)}
              className={`
                px-3 py-2 bg-gray-100 border rounded cursor-move
                transition-all duration-200 hover:scale-105
                ${selectedItems.includes(item) 
                  ? 'opacity-50 bg-gray-200' 
                  : 'hover:bg-gray-200'
                }
              `}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          min-h-24 border-2 border-dashed rounded-lg p-4 mb-6
          transition-colors duration-200
          ${draggedItem !== null 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300'
          }
        `}
      >
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Selected Numbers:
        </h3>
        {selectedItems.length === 0 ? (
          <p className="text-gray-400 text-center py-4">
            Drag numbers here to combine them
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item, index) => (
              <div
                key={index}
                className="px-3 py-1 bg-blue-100 border border-blue-300 rounded
                          flex items-center gap-2"
              >
                <span>{item}</span>
                <button
                  onClick={() => removeItem(item)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Sum Display */}
      <div className="text-center mb-6">
        <div className="inline-block p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Current Sum:</p>
          <p className={`text-2xl font-bold ${
            currentSum === config.target ? 'text-green-600' : 'text-gray-800'
          }`}>
            {currentSum}
          </p>
          {config.exactly && (
            <p className="text-sm text-gray-500 mt-1">
              Items: {selectedItems.length} / {config.exactly}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={!isValidSelection()}
          className={`
            px-6 py-2 rounded font-medium transition-all duration-200
            ${isValidSelection()
              ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Submit Combination
        </button>
        
        {!isValidSelection() && selectedItems.length > 0 && (
          <p className="text-sm text-orange-600 mt-2">
            {currentSum !== config.target && `Sum must equal ${config.target}`}
            {config.exactly && selectedItems.length !== config.exactly && 
              ` and you must select exactly ${config.exactly} items`}
          </p>
        )}
      </div>
    </div>
  );
}