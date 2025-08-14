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
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Multi-Factor Authentication</h2>
        </div>
        <p className="text-gray-700 text-lg mb-2">Complete all security verification steps</p>
        <p className="text-sm text-gray-500">This ensures your account remains secure</p>
        
        {/* Progress Indicator */}
        <div className="flex justify-center items-center mt-6 mb-8">
          {config.steps.map((_, index) => (
            <div key={index} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2
                ${index < currentStep ? 'bg-green-500 text-white border-green-500' : 
                  index === currentStep ? 'bg-blue-500 text-white border-blue-500' : 
                  'bg-gray-100 text-gray-600 border-gray-300'}
              `}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              {index < config.steps.length - 1 && (
                <div className={`w-12 h-1 ${index < currentStep ? 'bg-green-500' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 inline-block">
          <p className="text-sm text-blue-800 font-medium">
            Step {currentStep + 1} of {config.steps.length}
          </p>
        </div>
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
            px-8 py-3 rounded-lg font-medium transition-all duration-200 text-lg
            ${!currentAnswer
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
            }
          `}
        >
          {currentStep === config.steps.length - 1 ? 'Complete Authentication' : 'Continue'}
        </button>
        
        <p className="text-xs text-gray-400 mt-3">
          Enhanced security verification
        </p>
      </div>

      {/* Failure Warning */}
      {config.restartOnAnyFail && attempts > 0 && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-red-800 font-medium">
              Security Alert: Incorrect answers restart verification
            </p>
          </div>
          <p className="text-xs text-red-700">
            Attempts: {attempts} - For your security, any error restarts the process
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