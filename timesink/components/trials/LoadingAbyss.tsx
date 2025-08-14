'use client';

import { useState, useEffect, useRef } from 'react';

interface LoadingAbyssProps {
  config: {
    minMs: number;
    resetOnBlur?: boolean;
    message: string;
    checkpoints?: number[];
    fakeProgress?: boolean;
  };
  onSubmit: (answer: { requiredMs: number; blurEvents: number }) => void;
  onTimeUpdate?: (timeMs: number) => void;
}

export function LoadingAbyss({ config, onSubmit, onTimeUpdate }: LoadingAbyssProps) {
  const [startTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [blurEvents, setBlurEvents] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [hasBeenReset, setHasBeenReset] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  const elapsed = currentTime - startTime;
  const progress = Math.min((elapsed / config.minMs) * 100, 100);
  
  // Fake progress manipulation for extra frustration
  const displayProgress = config.fakeProgress 
    ? Math.min(progress * 1.2, 95) // Go faster, but cap at 95% until actually done
    : progress;

  useEffect(() => {
    const handleVisibilityChange = () => {
      const nowVisible = !document.hidden;
      setIsVisible(nowVisible);
      
      if (!nowVisible && config.resetOnBlur && !isComplete) {
        setBlurEvents(prev => prev + 1);
        
        // Reset progress if configured to do so
        if (!hasBeenReset) {
          setHasBeenReset(true);
          // Could reset timer here, but that would be too cruel
          // Instead, just track the blur event
        }
      }
    };

    const handleBlur = () => {
      if (config.resetOnBlur && !isComplete) {
        setBlurEvents(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [config.resetOnBlur, isComplete, hasBeenReset]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
      const newElapsed = now - startTime;
      
      onTimeUpdate?.(newElapsed);

      // Check if we've reached the minimum time
      if (newElapsed >= config.minMs && !isComplete) {
        setIsComplete(true);
        setTimeout(() => {
          onSubmit({
            requiredMs: newElapsed,
            blurEvents
          });
        }, 1000); // Small delay to show 100% briefly
      }
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startTime, config.minMs, isComplete, onSubmit, onTimeUpdate, blurEvents]);

  const getProgressMessage = () => {
    if (isComplete) {
      return "Verification complete!";
    }
    
    if (config.checkpoints) {
      for (let i = config.checkpoints.length - 1; i >= 0; i--) {
        if (elapsed >= config.checkpoints[i]) {
          const checkpointNames = [
            "Initializing security protocols...",
            "Validating user credentials...", 
            "Performing final verification...",
            "Almost complete..."
          ];
          return checkpointNames[i] || config.message;
        }
      }
    }
    
    return config.message;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-6">Please Wait</h2>
        
        {/* Main Progress Circle */}
        <div className="relative inline-block mb-6">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - displayProgress / 100)}`}
              className="text-blue-500 transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-700">
              {Math.round(displayProgress)}%
            </span>
          </div>
        </div>

        {/* Status Message */}
        <p className="text-lg text-gray-600 mb-4">
          {getProgressMessage()}
        </p>

        {/* Fake Progress Steps */}
        {config.checkpoints && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              {config.checkpoints.map((checkpoint, index) => (
                <span key={index} className={`
                  ${elapsed >= checkpoint ? 'text-green-600' : 'text-gray-400'}
                `}>
                  Step {index + 1}
                </span>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.min((elapsed / config.minMs) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Warnings */}
        {config.resetOnBlur && !isComplete && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Do not leave this page or the verification will restart
            </p>
            {blurEvents > 0 && (
              <p className="text-xs text-yellow-700 mt-1">
                Page left {blurEvents} time{blurEvents !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Time Remaining */}
        {!isComplete && (
          <p className="text-sm text-gray-500">
            Estimated time remaining: {Math.max(0, Math.ceil((config.minMs - elapsed) / 1000))} seconds
          </p>
        )}

        {/* Spinning Loader Animation */}
        {!isComplete && (
          <div className="mt-6">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Completion Message */}
        {isComplete && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">
              ✓ Verification process completed successfully
            </p>
          </div>
        )}
      </div>
    </div>
  );
}