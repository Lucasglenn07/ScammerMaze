export interface ValidationResult {
  success: boolean;
  reason?: string;
  restartOnFail?: boolean;
}

export interface BaseTrialConfig {
  difficulty?: number;
  minMs?: number;
  maxMs?: number;
  restartOnFail?: boolean;
}

// Image Hunt Validator
export function validateImageHunt(answer: any, config: any): ValidationResult {
  const { tiles, pattern } = config;
  const requiredTiles = pattern || [];
  
  if (!Array.isArray(answer) || !Array.isArray(requiredTiles)) {
    return { success: false, reason: 'Invalid format' };
  }
  
  // Check if selected tiles match required pattern exactly
  const sortedAnswer = [...answer].sort();
  const sortedRequired = [...requiredTiles].sort();
  
  if (sortedAnswer.length !== sortedRequired.length) {
    return { success: false, reason: 'Wrong number of tiles selected' };
  }
  
  for (let i = 0; i < sortedAnswer.length; i++) {
    if (sortedAnswer[i] !== sortedRequired[i]) {
      return { success: false, reason: 'Incorrect tiles selected' };
    }
  }
  
  return { success: true };
}

// Drag Sum Validator
export function validateDragSum(answer: any, config: any): ValidationResult {
  const { target, exactly } = config;
  const { selectedItems, sum } = answer;
  
  if (typeof sum !== 'number' || !Array.isArray(selectedItems)) {
    return { success: false, reason: 'Invalid format' };
  }
  
  if (sum !== target) {
    return { success: false, reason: 'Sum does not equal target' };
  }
  
  if (exactly && selectedItems.length !== exactly) {
    return { success: false, reason: `Must select exactly ${exactly} items` };
  }
  
  return { success: true };
}

// Trace Path Validator
export function validateTracePath(answer: any, config: any): ValidationResult {
  const { path, tolerancePx = 10, minVelocity = 50 } = config;
  const { userPath, avgVelocity } = answer;
  
  if (!Array.isArray(userPath) || typeof avgVelocity !== 'number') {
    return { success: false, reason: 'Invalid format' };
  }
  
  if (avgVelocity < minVelocity) {
    return { success: false, reason: 'Path traced too slowly' };
  }
  
  // Check if path matches within tolerance
  if (userPath.length < path.length * 0.8) {
    return { success: false, reason: 'Path incomplete' };
  }
  
  return { success: true };
}

// Audio Gate Validator
export function validateAudioGate(answer: any, config: any): ValidationResult {
  const { correctTimestamp, toleranceMs = 500 } = config;
  const { timestamp } = answer;
  
  if (typeof timestamp !== 'number') {
    return { success: false, reason: 'Invalid timestamp' };
  }
  
  const diff = Math.abs(timestamp - correctTimestamp);
  if (diff > toleranceMs) {
    return { success: false, reason: 'Incorrect timing' };
  }
  
  return { success: true };
}

// Captcha Loopback Validator
export function validateCaptchaLoopback(answer: any, config: any): ValidationResult {
  const { rule, expectedAnswer } = config;
  
  if (answer !== expectedAnswer) {
    return { 
      success: false, 
      reason: 'Incorrect answer',
      restartOnFail: true
    };
  }
  
  return { success: true };
}

// Loading Abyss Validator
export function validateLoadingAbyss(answer: any, config: any): ValidationResult {
  const { requiredMs, blurEvents } = answer;
  const { minMs = 30000 } = config;
  
  if (typeof requiredMs !== 'number' || blurEvents > 0) {
    return { 
      success: false, 
      reason: 'Progress lost due to leaving page',
      restartOnFail: true
    };
  }
  
  if (requiredMs < minMs) {
    return { success: false, reason: 'Insufficient wait time' };
  }
  
  return { success: true };
}

// Multi-Layer Captcha Validator
export function validateMultiLayerCaptcha(answer: any, config: any): ValidationResult {
  const { steps } = config;
  const { completedSteps } = answer;
  
  if (!Array.isArray(completedSteps) || completedSteps.length !== 3) {
    return { 
      success: false, 
      reason: 'All three steps must be completed',
      restartOnFail: true
    };
  }
  
  for (let i = 0; i < steps.length; i++) {
    if (completedSteps[i] !== steps[i].expectedAnswer) {
      return { 
        success: false, 
        reason: `Step ${i + 1} incorrect`,
        restartOnFail: true
      };
    }
  }
  
  return { success: true };
}

// Color Gradient Match Validator
export function validateColorGradientMatch(answer: any, config: any): ValidationResult {
  const { targetColor } = config;
  const { selectedColor } = answer;
  
  if (!selectedColor || !targetColor) {
    return { success: false, reason: 'Invalid color data' };
  }
  
  // Parse RGB values
  const target = parseRGB(targetColor);
  const selected = parseRGB(selectedColor);
  
  if (!target || !selected) {
    return { success: false, reason: 'Invalid color format' };
  }
  
  // Calculate color difference (very strict)
  const diff = Math.sqrt(
    Math.pow(target.r - selected.r, 2) +
    Math.pow(target.g - selected.g, 2) +
    Math.pow(target.b - selected.b, 2)
  );
  
  if (diff > 5) { // Very tight tolerance
    return { success: false, reason: 'Color match not precise enough' };
  }
  
  return { success: true };
}

// Pixel Perfect Click Validator
export function validatePixelPerfectClick(answer: any, config: any): ValidationResult {
  const { targetX, targetY, tolerancePx = 3 } = config;
  const { clickX, clickY } = answer;
  
  if (typeof clickX !== 'number' || typeof clickY !== 'number') {
    return { success: false, reason: 'Invalid click coordinates' };
  }
  
  const distance = Math.sqrt(
    Math.pow(clickX - targetX, 2) + 
    Math.pow(clickY - targetY, 2)
  );
  
  if (distance > tolerancePx) {
    return { success: false, reason: 'Click not precise enough' };
  }
  
  return { success: true };
}

// Additional validators for remaining trial types...
export function validateSlowReveal(answer: any, config: any): ValidationResult {
  const { revealTimeMs, startTime } = answer;
  const { minRevealMs = 60000 } = config;
  
  if (revealTimeMs < minRevealMs) {
    return { success: false, reason: 'Image not fully revealed' };
  }
  
  return { success: true };
}

export function validateInvisibleMaze(answer: any, config: any): ValidationResult {
  const { path, soundCues } = answer;
  const { requiredCues } = config;
  
  if (!soundCues || soundCues.length < requiredCues) {
    return { success: false, reason: 'Insufficient sound cue interactions' };
  }
  
  return { success: true };
}

export function validateMathChain(answer: any, config: any): ValidationResult {
  const { answers, delays } = answer;
  const { expectedAnswers, minDelayMs } = config;
  
  if (!Array.isArray(answers) || answers.length !== expectedAnswers.length) {
    return { success: false, reason: 'Incomplete math chain' };
  }
  
  for (let i = 0; i < answers.length; i++) {
    if (answers[i] !== expectedAnswers[i]) {
      return { success: false, reason: `Incorrect answer at step ${i + 1}` };
    }
    if (delays[i] < minDelayMs) {
      return { success: false, reason: 'Answers submitted too quickly' };
    }
  }
  
  return { success: true };
}

export function validateDocumentReview(answer: any, config: any): ValidationResult {
  const { answers, pagesScrolled } = answer;
  const { expectedAnswers, requiredPages = 5 } = config;
  
  if (pagesScrolled < requiredPages) {
    return { success: false, reason: 'Must review all pages' };
  }
  
  for (const [question, expectedAnswer] of Object.entries(expectedAnswers)) {
    if (answers[question] !== expectedAnswer) {
      return { success: false, reason: 'Incorrect answer to review question' };
    }
  }
  
  return { success: true };
}

export function validateKeypressCombo(answer: any, config: any): ValidationResult {
  const { sequence, timings } = answer;
  const { expectedSequence, windowMs = 50 } = config;
  
  if (!Array.isArray(sequence) || sequence.length !== expectedSequence.length) {
    return { success: false, reason: 'Incorrect key sequence' };
  }
  
  for (let i = 0; i < sequence.length; i++) {
    if (sequence[i] !== expectedSequence[i]) {
      return { success: false, reason: 'Wrong key pressed' };
    }
    
    if (i > 0 && Math.abs(timings[i] - timings[i-1]) > windowMs) {
      return { success: false, reason: 'Timing window missed' };
    }
  }
  
  return { success: true };
}

export function validateVideoFrameSearch(answer: any, config: any): ValidationResult {
  const { foundWord, timestamp } = answer;
  const { expectedWord, expectedTimestamp, toleranceMs = 1000 } = config;
  
  if (foundWord !== expectedWord) {
    return { success: false, reason: 'Incorrect word found' };
  }
  
  if (Math.abs(timestamp - expectedTimestamp) > toleranceMs) {
    return { success: false, reason: 'Word found at wrong timestamp' };
  }
  
  return { success: true };
}

export function validateLoopedAlmostDone(answer: any, config: any): ValidationResult {
  const { step } = answer;
  const { loopbackChance = 0.5 } = config;
  
  // Randomly fail on final step to create frustration
  if (step === 'final' && Math.random() < loopbackChance) {
    return { 
      success: false, 
      reason: 'Final verification failed',
      restartOnFail: true
    };
  }
  
  return { success: true };
}

// Master validation function
export function validateTrialAnswer(trialKind: string, answer: any, config: any): ValidationResult {
  const validators: Record<string, (answer: any, config: any) => ValidationResult> = {
    image_hunt: validateImageHunt,
    drag_sum: validateDragSum,
    trace_path: validateTracePath,
    audio_gate: validateAudioGate,
    captcha_loopback: validateCaptchaLoopback,
    loading_abyss: validateLoadingAbyss,
    multi_layer_captcha: validateMultiLayerCaptcha,
    color_gradient_match: validateColorGradientMatch,
    pixel_perfect_click: validatePixelPerfectClick,
    slow_reveal: validateSlowReveal,
    invisible_maze: validateInvisibleMaze,
    math_chain: validateMathChain,
    document_review: validateDocumentReview,
    keypress_combo: validateKeypressCombo,
    video_frame_search: validateVideoFrameSearch,
    looped_almost_done: validateLoopedAlmostDone,
  };
  
  const validator = validators[trialKind];
  if (!validator) {
    return { success: false, reason: 'Unknown trial type' };
  }
  
  return validator(answer, config);
}

// Helper function to parse RGB color
function parseRGB(color: string): {r: number, g: number, b: number} | null {
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return null;
  
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3])
  };
}