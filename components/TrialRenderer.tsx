'use client';

import { useState, useEffect } from 'react';
import { ImageHunt } from './trials/ImageHunt';
import { DragSum } from './trials/DragSum';
import { LoadingAbyss } from './trials/LoadingAbyss';
import { MultiLayerCaptcha } from './trials/MultiLayerCaptcha';

// Import other trial components as they're created
// import { TracePath } from './trials/TracePath';
// import { AudioGate } from './trials/AudioGate';
// import { CaptchaLoopback } from './trials/CaptchaLoopback';
// import { ColorGradientMatch } from './trials/ColorGradientMatch';
// import { PixelPerfectClick } from './trials/PixelPerfectClick';
// import { SlowReveal } from './trials/SlowReveal';
// import { InvisibleMaze } from './trials/InvisibleMaze';
// import { MathChain } from './trials/MathChain';
// import { DocumentReview } from './trials/DocumentReview';
// import { KeypressCombo } from './trials/KeypressCombo';
// import { VideoFrameSearch } from './trials/VideoFrameSearch';
// import { LoopedAlmostDone } from './trials/LoopedAlmostDone';

interface Trial {
  id: string;
  kind: string;
  config: any;
  position: number;
}

interface TrialRendererProps {
  trial: Trial;
  sessionId: string;
  onComplete: (answer: any) => void;
  onTimeUpdate?: (timeMs: number) => void;
}

export function TrialRenderer({ trial, sessionId, onComplete, onTimeUpdate }: TrialRendererProps) {
  const [startTime] = useState(Date.now());

  useEffect(() => {
    // Log trial start for analytics
    console.log(`Trial started: ${trial.kind} (${trial.id})`);
  }, [trial]);

  const handleSubmit = (answer: any) => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`Trial completed: ${trial.kind} in ${duration}ms`);
    
    onComplete({
      trialId: trial.id,
      answer,
      duration,
      startTime,
      endTime
    });
  };

  const handleTimeUpdate = (timeMs: number) => {
    onTimeUpdate?.(timeMs);
  };

  // Render trial based on kind
  switch (trial.kind) {
    case 'image_hunt':
      return (
        <ImageHunt 
          config={trial.config}
          onSubmit={handleSubmit}
          onTimeUpdate={handleTimeUpdate}
        />
      );
      
    case 'drag_sum':
      return (
        <DragSum 
          config={trial.config}
          onSubmit={handleSubmit}
          onTimeUpdate={handleTimeUpdate}
        />
      );
      
    case 'loading_abyss':
      return (
        <LoadingAbyss 
          config={trial.config}
          onSubmit={handleSubmit}
          onTimeUpdate={handleTimeUpdate}
        />
      );
      
    case 'multi_layer_captcha':
      return (
        <MultiLayerCaptcha 
          config={trial.config}
          onSubmit={handleSubmit}
          onTimeUpdate={handleTimeUpdate}
        />
      );
      
    // Placeholder implementations for other trial types
    case 'trace_path':
      return <PlaceholderTrial trialKind="Trace Path" onSubmit={handleSubmit} />;
      
    case 'audio_gate':
      return <PlaceholderTrial trialKind="Audio Gate" onSubmit={handleSubmit} />;
      
    case 'captcha_loopback':
      return <PlaceholderTrial trialKind="Captcha Loopback" onSubmit={handleSubmit} />;
      
    case 'color_gradient_match':
      return <PlaceholderTrial trialKind="Color Gradient Match" onSubmit={handleSubmit} />;
      
    case 'pixel_perfect_click':
      return <PlaceholderTrial trialKind="Pixel Perfect Click" onSubmit={handleSubmit} />;
      
    case 'slow_reveal':
      return <PlaceholderTrial trialKind="Slow Reveal" onSubmit={handleSubmit} />;
      
    case 'invisible_maze':
      return <PlaceholderTrial trialKind="Invisible Maze" onSubmit={handleSubmit} />;
      
    case 'math_chain':
      return <PlaceholderTrial trialKind="Math Chain" onSubmit={handleSubmit} />;
      
    case 'document_review':
      return <PlaceholderTrial trialKind="Document Review" onSubmit={handleSubmit} />;
      
    case 'keypress_combo':
      return <PlaceholderTrial trialKind="Keypress Combo" onSubmit={handleSubmit} />;
      
    case 'video_frame_search':
      return <PlaceholderTrial trialKind="Video Frame Search" onSubmit={handleSubmit} />;
      
    case 'looped_almost_done':
      return <PlaceholderTrial trialKind="Looped Almost Done" onSubmit={handleSubmit} />;
      
    default:
      return (
        <div className="max-w-2xl mx-auto p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Unknown Trial Type</h2>
          <p className="text-gray-600 mb-4">
            Trial type "{trial.kind}" is not recognized.
          </p>
          <button
            onClick={() => handleSubmit({ error: 'unknown_trial_type' })}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Skip This Step
          </button>
        </div>
      );
  }
}

// Placeholder component for trials that haven't been implemented yet
function PlaceholderTrial({ 
  trialKind, 
  onSubmit 
}: { 
  trialKind: string; 
  onSubmit: (answer: any) => void; 
}) {
  const [timeWasted, setTimeWasted] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeWasted(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <h2 className="text-xl font-semibold mb-4">{trialKind}</h2>
      <p className="text-gray-600 mb-4">
        This verification step is being prepared...
      </p>
      
      {/* Fake loading to waste time */}
      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-300 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mb-4">
        Please wait... {timeWasted} seconds elapsed
      </p>
      
      {timeWasted >= 5 && (
        <button
          onClick={() => onSubmit({ placeholder: true, timeWasted })}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Continue Verification
        </button>
      )}
    </div>
  );
}

export default TrialRenderer;