'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { ThemedProgressBanner } from '@/components/ProgressBanner';
import TrialRenderer from '@/components/TrialRenderer';

interface SessionData {
  id: string;
  maze: {
    id: string;
    name: string;
    settings: any;
  };
  status: string;
  actualStepsCompleted: number;
  expiresAt: string;
}

interface TrialData {
  id: string;
  kind: string;
  config: any;
  position: number;
}

export default function PlaySession() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  
  const [session, setSession] = useState<SessionData | null>(null);
  const [currentTrial, setCurrentTrial] = useState<TrialData | null>(null);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [displayProgress, setDisplayProgress] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [restartMessage, setRestartMessage] = useState<string | null>(null);
  
  // Activity tracking
  const [inputEvents, setInputEvents] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();
  const rrwebStopFn = useRef<(() => void) | null>(null);

  // Initialize session and start recording
  useEffect(() => {
    if (!sessionId) return;

    initializeSession();
    startActivityTracking();
    startRRWebRecording();

    return () => {
      stopActivityTracking();
      stopRRWebRecording();
    };
  }, [sessionId]);

  const initializeSession = async () => {
    try {
      const response = await fetch('/api/maze-runtime/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize session');
      }

      if (data.shouldRestart) {
        setRestartMessage(data.message);
        setDisplayProgress(data.displayProgress);
        // Wait a moment then restart
        setTimeout(() => {
          setRestartMessage(null);
          initializeSession();
        }, 3000);
        return;
      }

      if (data.isComplete) {
        setIsComplete(true);
        return;
      }

      setCurrentTrial(data.trial);
      setCurrentToken(data.newToken);
      setDisplayProgress(data.displayProgress);
      setIsLoading(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
    }
  };

  const startActivityTracking = () => {
    // Track input events
    const trackInput = () => {
      setInputEvents(prev => prev + 1);
    };

    // Track visibility
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    // Add event listeners
    document.addEventListener('click', trackInput);
    document.addEventListener('keydown', trackInput);
    document.addEventListener('mousemove', trackInput);
    document.addEventListener('scroll', trackInput);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start heartbeat
    heartbeatIntervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, 5000);

    // Cleanup function
    return () => {
      document.removeEventListener('click', trackInput);
      document.removeEventListener('keydown', trackInput);
      document.removeEventListener('mousemove', trackInput);
      document.removeEventListener('scroll', trackInput);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  };

  const stopActivityTracking = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
  };

  const sendHeartbeat = async () => {
    try {
      await fetch('/api/telemetry/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          isVisible,
          inputEvents,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.warn('Failed to send heartbeat:', error);
    }
  };

  const startRRWebRecording = async () => {
    try {
      // Dynamically import rrweb to avoid SSR issues
      const { record } = await import('rrweb');
      
      const events: any[] = [];
      
      rrwebStopFn.current = record({
        emit(event) {
          events.push(event);
          
          // Send events in batches
          if (events.length >= 10) {
            sendRRWebEvents([...events]);
            events.length = 0;
          }
        },
        checkoutEveryNms: 30000, // Checkout every 30 seconds
      });

      // Send remaining events on page unload
      window.addEventListener('beforeunload', () => {
        if (events.length > 0) {
          sendRRWebEvents([...events]);
        }
      });

    } catch (error) {
      console.warn('Failed to start rrweb recording:', error);
    }
  };

  const stopRRWebRecording = () => {
    if (rrwebStopFn.current) {
      rrwebStopFn.current();
      rrwebStopFn.current = null;
    }
  };

  const sendRRWebEvents = async (events: any[]) => {
    try {
      await fetch('/api/telemetry/rrweb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          events
        })
      });
    } catch (error) {
      console.warn('Failed to send rrweb events:', error);
    }
  };

  const handleTrialComplete = async (result: any) => {
    if (!currentToken) return;

    try {
      const response = await fetch('/api/maze-runtime/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          token: currentToken,
          trialId: result.trialId,
          answer: result.answer
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      if (data.shouldRestart) {
        setRestartMessage(data.message);
        setDisplayProgress(data.displayProgress);
        setTimeout(() => {
          setRestartMessage(null);
          initializeSession();
        }, 3000);
        return;
      }

      if (data.isComplete) {
        setIsComplete(true);
        return;
      }

      // Get next trial
      setDisplayProgress(data.displayProgress);
      setCurrentToken(data.nextToken);
      
      if (data.outcome === 'success') {
        // Load next trial
        setTimeout(() => {
          initializeSession();
        }, 1000);
      } else {
        // Retry current trial with new token
        setError(data.reason || 'Please try again');
        setTimeout(() => {
          setError(null);
        }, 3000);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const getCoverStory = () => {
    const defaultStory = {
      title: "Payment Verification Required",
      subtitle: "Complete the steps to release funds.",
      message: "I'm trying to send the funds but it's saying you must complete this verification to ensure I'm not sending funds to a bot."
    };

    return session?.maze?.settings?.coverStory || defaultStory;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification system...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ThemedProgressBanner 
          actualStepsCompleted={displayProgress} 
          theme="business"
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">Verification Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                initializeSession();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (restartMessage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ThemedProgressBanner 
          actualStepsCompleted={displayProgress} 
          theme="business"
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-orange-500 text-4xl mb-4">🔄</div>
            <h2 className="text-xl font-semibold text-orange-600 mb-2">Verification Reset</h2>
            <p className="text-gray-600 mb-4">{restartMessage}</p>
            <p className="text-sm text-gray-500">Restarting verification process...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ThemedProgressBanner 
          actualStepsCompleted={10} 
          theme="business"
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-green-500 text-4xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-green-600 mb-2">Verification Complete</h2>
            <p className="text-gray-600">Your verification has been successfully completed.</p>
          </div>
        </div>
      </div>
    );
  }

  const coverStory = getCoverStory();
  const theme = session?.maze?.settings?.theme || 'business';

  return (
    <div className="min-h-screen bg-gray-50">
      <ThemedProgressBanner 
        actualStepsCompleted={displayProgress} 
        theme={theme}
      />
      
      {/* Cover Story Header */}
      <div className="bg-white border-b py-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {coverStory.title}
          </h1>
          <p className="text-gray-600 mb-4">
            {coverStory.subtitle}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-sm text-blue-800">
              {coverStory.message}
            </p>
          </div>
        </div>
      </div>

      {/* Current Trial */}
      <main className="py-8">
        {currentTrial && (
          <TrialRenderer
            trial={currentTrial}
            sessionId={sessionId}
            onComplete={handleTrialComplete}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t py-4">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-500">
            Abuse-deterrence research; no personal services provided.
          </p>
        </div>
      </footer>
    </div>
  );
}