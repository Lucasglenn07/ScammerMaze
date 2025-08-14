'use client';

import { useState, useEffect } from 'react';

interface SlowRevealProps {
  config: {
    revealMs: number;
    image: string;
    expectedAnswer: string;
    difficulty?: number;
    progressSteps?: number;
  };
  onSubmit: (answer: { revealedText: string; timeSpent: number }) => void;
  onTimeUpdate?: (timeMs: number) => void;
}

export function SlowReveal({ config, onSubmit, onTimeUpdate }: SlowRevealProps) {
  const [startTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [userAnswer, setUserAnswer] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const elapsed = currentTime - startTime;
  const progress = Math.min((elapsed / config.revealMs) * 100, 100);
  const progressSteps = config.progressSteps || 20;
  const currentStep = Math.floor((progress / 100) * progressSteps);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
      const newElapsed = now - startTime;
      
      onTimeUpdate?.(newElapsed);

      if (newElapsed >= config.revealMs && !isComplete) {
        setIsComplete(true);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [startTime, config.revealMs, isComplete, onTimeUpdate]);

  const handleSubmit = () => {
    onSubmit({
      revealedText: userAnswer,
      timeSpent: elapsed
    });
  };

  // Generate a fake text that gradually reveals
  const getRevealedText = () => {
    const fullText = config.expectedAnswer;
    const revealLength = Math.floor((progress / 100) * fullText.length);
    return fullText.substring(0, revealLength) + '█'.repeat(fullText.length - revealLength);
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Security Code Verification</h2>
        </div>
        <p className="text-gray-700 text-lg mb-2">Please read the security code as it appears</p>
        <p className="text-sm text-gray-500">This helps verify your identity</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Revealing security code...</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-orange-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Revealed Text Display */}
      <div className="mb-8">
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Security Code:</p>
          <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
            <p className="text-2xl font-mono text-gray-800 tracking-wider">
              {getRevealedText()}
            </p>
          </div>
          
          {!isComplete && (
            <div className="flex items-center justify-center text-orange-600">
              <svg className="w-4 h-4 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">Code is being revealed...</span>
            </div>
          )}
          
          {isComplete && (
            <div className="flex items-center justify-center text-green-600">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium">Code fully revealed</span>
            </div>
          )}
        </div>
      </div>

      {/* Input Field */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
          Enter the security code you see above:
        </label>
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-lg font-mono"
          placeholder="Enter code..."
          disabled={!isComplete}
        />
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={!isComplete || !userAnswer}
          className={`
            px-8 py-3 rounded-lg font-medium transition-all duration-200 text-lg
            ${!isComplete || !userAnswer
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-orange-700 hover:shadow-lg transform hover:scale-105'
            }
          `}
        >
          Verify Security Code
        </button>
        
        {!isComplete && (
          <p className="text-sm text-gray-500 mt-3">
            Please wait for the code to fully reveal
          </p>
        )}
        
        <p className="text-xs text-gray-400 mt-3">
          Enhanced security verification process
        </p>
      </div>

      {/* Time Remaining */}
      {!isComplete && (
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-sm text-blue-800">
            Time remaining: {Math.max(0, Math.ceil((config.revealMs - elapsed) / 1000))} seconds
          </p>
        </div>
      )}
    </div>
  );
}
