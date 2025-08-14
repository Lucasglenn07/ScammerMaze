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
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Transaction Verification</h2>
        </div>
        <p className="text-gray-700 text-lg mb-2">{config.instruction}</p>
        <p className="text-sm text-gray-500 mb-4">Please select the correct combination to proceed</p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
          <p className="text-sm text-blue-800 mb-1">Target Amount:</p>
          <p className="text-2xl font-bold text-blue-900">${config.target}</p>
          {config.exactly && (
            <p className="text-xs text-blue-600 mt-1">
              Select exactly {config.exactly} items
            </p>
          )}
        </div>
      </div>

      {/* Available Items */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">Available Amounts:</h3>
        <div className="flex flex-wrap gap-3 justify-center">
          {config.items.map((item, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(item)}
              className={`
                px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg cursor-move
                transition-all duration-200 hover:scale-105 hover:shadow-md
                ${selectedItems.includes(item) 
                  ? 'opacity-50 bg-gray-200 border-gray-300' 
                  : 'hover:bg-gray-100 hover:border-blue-300'
                }
              `}
            >
              <span className="text-lg font-medium text-gray-700">${item}</span>
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
          min-h-32 border-2 border-dashed rounded-lg p-6 mb-8
          transition-colors duration-200
          ${draggedItem !== null 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300'
          }
        `}
      >
        <h3 className="text-sm font-medium text-gray-700 mb-3 text-center">
          Selected Amounts:
        </h3>
        {selectedItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-gray-400">
              Drag amounts here to combine them
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 justify-center">
            {selectedItems.map((item, index) => (
              <div
                key={index}
                className="px-4 py-2 bg-blue-100 border border-blue-300 rounded-lg
                          flex items-center gap-3"
              >
                <span className="font-medium text-blue-900">${item}</span>
                <button
                  onClick={() => removeItem(item)}
                  className="text-red-500 hover:text-red-700 text-sm bg-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Sum Display */}
      <div className="text-center mb-8">
        <div className="inline-block p-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Current Total:</p>
          <p className={`text-3xl font-bold ${
            currentSum === config.target ? 'text-green-600' : 'text-gray-800'
          }`}>
            ${currentSum}
          </p>
          {config.exactly && (
            <p className="text-sm text-gray-500 mt-2">
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
            px-8 py-3 rounded-lg font-medium transition-all duration-200 text-lg
            ${isValidSelection()
              ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Verify Transaction
        </button>
        
        {!isValidSelection() && selectedItems.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              {currentSum !== config.target && `Total must equal $${config.target}`}
              {config.exactly && selectedItems.length !== config.exactly && 
                ` and you must select exactly ${config.exactly} items`}
            </p>
          </div>
        )}
        
        <p className="text-xs text-gray-400 mt-3">
          Secure transaction processing
        </p>
      </div>
    </div>
  );
}