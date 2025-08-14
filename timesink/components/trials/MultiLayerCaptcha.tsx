'use client';

import { useState, useEffect } from 'react';

interface MultiLayerCaptchaProps {
  config: {
    steps: Array<{
      type: string;
      expectedAnswer: any;
    }>;
    difficulty?: number;
    restartOnAnyFail?: boolean;
  };
  onSubmit: (answer: { completedSteps: any[] }) => void;
  onTimeUpdate?: (timeMs: number) => void;
}

export function MultiLayerCaptcha({ config, onSubmit, onTimeUpdate }: MultiLayerCaptchaProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<any[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<any>('');
  const [startTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      onTimeUpdate?.(elapsed);
    }, 100);

    return () => clearInterval(timer);
  }, [startTime, onTimeUpdate]);

  const getCurrentStepConfig = () => config.steps[currentStep];

  const handleStepSubmit = () => {
    const stepConfig = getCurrentStepConfig();
    const isCorrect = validateAnswer(stepConfig, currentAnswer);

    if (isCorrect) {
      const newCompleted = [...completedSteps, currentAnswer];
      setCompletedSteps(newCompleted);
      
      if (currentStep === config.steps.length - 1) {
        // All steps completed
        onSubmit({ completedSteps: newCompleted });
      } else {
        // Move to next step
        setCurrentStep(prev => prev + 1);
        setCurrentAnswer('');
      }
    } else {
      setAttempts(prev => prev + 1);
      
      if (config.restartOnAnyFail) {
        // Reset everything
        setCurrentStep(0);
        setCompletedSteps([]);
        setCurrentAnswer('');
      }
    }
  };

  const validateAnswer = (stepConfig: any, answer: any) => {
    switch (stepConfig.type) {
      case 'image':
        return answer.toLowerCase() === stepConfig.expectedAnswer.toLowerCase();
      case 'math':
        return parseInt(answer) === stepConfig.expectedAnswer;
      case 'sequence':
        try {
          const parsed = JSON.parse(answer);
          return Array.isArray(parsed) && 
                 parsed.length === stepConfig.expectedAnswer.length &&
                 parsed.every((val, idx) => val === stepConfig.expectedAnswer[idx]);
        } catch {
          return false;
        }
      case 'rotate':
        return answer === stepConfig.expectedAnswer;
      case 'count':
        return parseInt(answer) === stepConfig.expectedAnswer;
      default:
        return answer === stepConfig.expectedAnswer;
    }
  };

  const renderCurrentStep = () => {
    const stepConfig = getCurrentStepConfig();
    
    switch (stepConfig.type) {
      case 'image':
        return (
          <div className="text-center">
            <div className="bg-gray-200 p-8 rounded-lg mb-4 text-6xl">
              🌉
            </div>
            <p className="mb-4">What do you see in the image above?</p>
            <input
              type="text"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="border rounded px-3 py-2 w-full max-w-xs"
              placeholder="Type what you see..."
            />
          </div>
        );
        
      case 'math':
        return (
          <div className="text-center">
            <div className="bg-blue-50 p-6 rounded-lg mb-4">
              <p className="text-2xl font-mono">17 + 25 = ?</p>
            </div>
            <input
              type="number"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="border rounded px-3 py-2 w-full max-w-xs"
              placeholder="Enter the answer..."
            />
          </div>
        );
        
      case 'sequence':
        return (
          <div className="text-center">
            <div className="bg-green-50 p-6 rounded-lg mb-4">
              <p className="mb-2">Arrange these numbers in ascending order:</p>
              <div className="flex justify-center gap-2 text-xl font-mono">
                <span className="bg-white px-3 py-1 rounded">5</span>
                <span className="bg-white px-3 py-1 rounded">1</span>
                <span className="bg-white px-3 py-1 rounded">3</span>
              </div>
            </div>
            <input
              type="text"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="border rounded px-3 py-2 w-full max-w-xs"
              placeholder="[1,3,5]"
            />
            <p className="text-xs text-gray-500 mt-1">Format: [1,3,5]</p>
          </div>
        );
        
      case 'rotate':
        return (
          <div className="text-center">
            <div className="bg-yellow-50 p-6 rounded-lg mb-4">
              <div className="text-4xl transform rotate-180 inline-block">🏠</div>
              <p className="mt-2">Rotate the image to be upright</p>
            </div>
            <select
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Select rotation...</option>
              <option value="upright">Upright</option>
              <option value="90">90° clockwise</option>
              <option value="180">180°</option>
              <option value="270">270° clockwise</option>
            </select>
          </div>
        );
        
      case 'count':
        return (
          <div className="text-center">
            <div className="bg-purple-50 p-6 rounded-lg mb-4">
              <div className="text-3xl">🐱🐱🐱🐱🐱🐱🐱</div>
              <p className="mt-2">How many cats are there?</p>
            </div>
            <input
              type="number"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="border rounded px-3 py-2 w-full max-w-xs"
              placeholder="Enter count..."
            />
          </div>
        );
        
      default:
        return (
          <div className="text-center">
            <p className="mb-4">Unknown step type</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Security Verification</h2>
        <p className="text-gray-600">Complete all verification steps</p>
        
        {/* Progress Indicator */}
        <div className="flex justify-center items-center mt-4 mb-6">
          {config.steps.map((_, index) => (
            <div key={index} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${index < currentStep ? 'bg-green-500 text-white' : 
                  index === currentStep ? 'bg-blue-500 text-white' : 
                  'bg-gray-300 text-gray-600'}
              `}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              {index < config.steps.length - 1 && (
                <div className={`w-8 h-0.5 ${index < currentStep ? 'bg-green-500' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>
        
        <p className="text-sm text-gray-500">
          Step {currentStep + 1} of {config.steps.length}
        </p>
      </div>

      {/* Current Step Content */}
      <div className="mb-6">
        {renderCurrentStep()}
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          onClick={handleStepSubmit}
          disabled={!currentAnswer}
          className={`
            px-6 py-2 rounded font-medium transition-all duration-200
            ${!currentAnswer
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
            }
          `}
        >
          {currentStep === config.steps.length - 1 ? 'Complete Verification' : 'Next Step'}
        </button>
      </div>

      {/* Failure Warning */}
      {config.restartOnAnyFail && attempts > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-sm text-red-800">
            ⚠️ Any incorrect answer will restart the entire verification process
          </p>
          <p className="text-xs text-red-600 mt-1">
            Attempts: {attempts}
          </p>
        </div>
      )}

      {/* Completed Steps */}
      {completedSteps.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Completed Steps:</h3>
          <div className="flex gap-2">
            {completedSteps.map((step, index) => (
              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                Step {index + 1} ✓
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}