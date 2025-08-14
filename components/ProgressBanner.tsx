'use client';

import { useMemo } from 'react';

interface ProgressBannerProps {
  actualStepsCompleted: number;
  totalSteps?: number;
  className?: string;
}

export function ProgressBanner({ 
  actualStepsCompleted, 
  totalSteps = 10,
  className = ""
}: ProgressBannerProps) {
  // Progress illusion: display (actualStepsCompleted % 10) || 10
  const displayProgress = useMemo(() => {
    return (actualStepsCompleted % 10) || 10;
  }, [actualStepsCompleted]);

  const progressPercentage = (displayProgress / totalSteps) * 100;

  return (
    <div className={`bg-blue-600 text-white py-3 px-4 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Verification Progress
          </span>
          <span className="text-sm">
            {displayProgress} of {totalSteps} tasks complete
          </span>
        </div>
        
        <div className="w-full bg-blue-500 rounded-full h-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {displayProgress === totalSteps && (
          <div className="mt-2 text-xs text-blue-100">
            Almost done! Final verification steps remaining...
          </div>
        )}
      </div>
    </div>
  );
}

// Variant for different themes
interface ThemedProgressBannerProps extends ProgressBannerProps {
  theme?: 'business' | 'security' | 'prize';
}

export function ThemedProgressBanner({ 
  theme = 'business', 
  ...props 
}: ThemedProgressBannerProps) {
  const themeStyles = {
    business: 'bg-blue-600 text-white',
    security: 'bg-red-600 text-white',
    prize: 'bg-green-600 text-white'
  };

  const themeMessages = {
    business: 'Payment Verification Progress',
    security: 'Security Verification Progress', 
    prize: 'Prize Claim Progress'
  };

  return (
    <div className={`${themeStyles[theme]} py-3 px-4 ${props.className || ''}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {themeMessages[theme]}
          </span>
          <span className="text-sm">
            {(props.actualStepsCompleted % 10) || 10} of 10 tasks complete
          </span>
        </div>
        
        <div className={`w-full ${theme === 'business' ? 'bg-blue-500' : theme === 'security' ? 'bg-red-500' : 'bg-green-500'} rounded-full h-2`}>
          <div 
            className="bg-white h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(((props.actualStepsCompleted % 10) || 10) / 10) * 100}%` }}
          />
        </div>
        
        {((props.actualStepsCompleted % 10) || 10) === 10 && (
          <div className="mt-2 text-xs opacity-80">
            Almost done! Final verification steps remaining...
          </div>
        )}
      </div>
    </div>
  );
}