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
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Processing Transaction</h2>
        </div>
        
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
        <p className="text-lg text-gray-700 mb-4">
          {getProgressMessage()}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Please do not close this window or navigate away
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-red-800 font-medium">
                Security Alert: Do not leave this page
              </p>
            </div>
            <p className="text-xs text-red-700 mt-1">
              Leaving this page will restart the verification process for security reasons
            </p>
            {blurEvents > 0 && (
              <p className="text-xs text-red-600 mt-2 font-medium">
                ⚠️ Page left {blurEvents} time{blurEvents !== 1 ? 's' : ''} - verification restarted
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
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800 font-medium">
                Transaction verification completed successfully
              </p>
            </div>
          </div>
        )}
        
        <p className="text-xs text-gray-400 mt-4">
          Secure banking protocols in place
        </p>
      </div>
    </div>
  );
}