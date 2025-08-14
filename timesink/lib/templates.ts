export interface MazeTemplate {
  id: string;
  name: string;
  description: string;
  coverStory: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTimeWasted: string;
  trials: TrialTemplate[];
  edges: EdgeTemplate[];
  settings: MazeSettings;
}

export interface TrialTemplate {
  position: number;
  kind: string;
  config: any;
}

export interface EdgeTemplate {
  fromPosition: number;
  toPosition: number;
  condition: any;
}

export interface MazeSettings {
  theme: string;
  allowSkip: boolean;
  showHints: boolean;
  enableSounds: boolean;
  coverStory: string;
}

export const COVER_STORIES = {
  invoice: {
    title: "Payment Verification Required",
    subtitle: "Complete the steps to release funds.",
    message: "I'm trying to send the funds but it's saying you must complete this verification to ensure I'm not sending funds to a bot."
  },
  account: {
    title: "Account Security Verification",
    subtitle: "Verify your identity to unlock your account.",
    message: "Your account has been temporarily locked due to suspicious activity. Please complete the verification process to regain access."
  },
  prize: {
    title: "Prize Claim Verification",
    subtitle: "Complete verification to claim your reward.",
    message: "Congratulations! You've won a valuable prize. Complete these quick verification steps to claim your reward."
  }
};

export const MAZE_TEMPLATES: MazeTemplate[] = [
  {
    id: 'basic-looping-maze',
    name: 'Basic Looping Maze',
    description: 'A simple maze with 5 different tasks that loops continuously',
    coverStory: COVER_STORIES.invoice.message,
    difficulty: 'easy',
    estimatedTimeWasted: '10-20 minutes',
    trials: [
      {
        position: 0,
        kind: 'image_hunt',
        config: {
          difficulty: 1,
          tiles: 16,
          pattern: [2, 7, 11, 14],
          instruction: 'Select all images containing traffic lights',
          minMs: 3000
        }
      },
      {
        position: 1,
        kind: 'drag_sum',
        config: {
          difficulty: 2,
          target: 100,
          exactly: 4,
          items: [15, 25, 30, 35, 40, 45],
          instruction: 'Drag exactly 4 items that sum to 100'
        }
      },
      {
        position: 2,
        kind: 'loading_abyss',
        config: {
          minMs: 15000,
          resetOnBlur: true,
          message: 'Processing verification...',
          checkpoints: [5000, 10000, 12000]
        }
      },
      {
        position: 3,
        kind: 'multi_layer_captcha',
        config: {
          difficulty: 2,
          steps: [
            { type: 'image', expectedAnswer: 'bridge' },
            { type: 'math', expectedAnswer: 42 }
          ]
        }
      },
      {
        position: 4,
        kind: 'slow_reveal',
        config: {
          difficulty: 3,
          revealMs: 20000,
          image: 'captcha-text',
          expectedAnswer: 'VERIFY'
        }
      }
    ],
    edges: [
      {
        fromPosition: 4,
        toPosition: 0,
        condition: { loopback: true, chance: 0.8 }
      }
    ],
    settings: {
      theme: 'business',
      allowSkip: false,
      showHints: false,
      enableSounds: true,
      coverStory: COVER_STORIES.invoice.message
    }
  },
  {
    id: 'invoice-verification',
    name: 'Invoice Verification',
    description: 'Classic payment verification flow with progressive difficulty',
    coverStory: COVER_STORIES.invoice.message,
    difficulty: 'medium',
    estimatedTimeWasted: '15-25 minutes',
    trials: [
      {
        position: 0,
        kind: 'image_hunt',
        config: {
          difficulty: 1,
          tiles: 16,
          pattern: [2, 7, 11, 14],
          instruction: 'Select all images containing traffic lights',
          minMs: 3000
        }
      },
      {
        position: 1,
        kind: 'drag_sum',
        config: {
          difficulty: 2,
          target: 100,
          exactly: 4,
          items: [15, 25, 30, 35, 40, 45],
          instruction: 'Drag exactly 4 items that sum to 100'
        }
      },
      {
        position: 2,
        kind: 'loading_abyss',
        config: {
          minMs: 30000,
          resetOnBlur: true,
          message: 'Processing payment verification...',
          checkpoints: [10000, 20000, 25000]
        }
      },
      {
        position: 3,
        kind: 'multi_layer_captcha',
        config: {
          difficulty: 3,
          steps: [
            { type: 'image', expectedAnswer: 'bridge' },
            { type: 'math', expectedAnswer: 42 },
            { type: 'sequence', expectedAnswer: [1, 3, 5] }
          ]
        }
      },
      {
        position: 4,
        kind: 'trace_path',
        config: {
          difficulty: 3,
          path: [[0, 0], [50, 25], [100, 0], [150, 50], [200, 25]],
          tolerancePx: 8,
          minVelocity: 40
        }
      },
      {
        position: 5,
        kind: 'color_gradient_match',
        config: {
          difficulty: 4,
          targetColor: 'rgb(128, 147, 165)',
          gridSize: 8,
          similarColors: 15
        }
      },
      {
        position: 6,
        kind: 'slow_reveal',
        config: {
          difficulty: 4,
          revealMs: 45000,
          image: 'captcha-text',
          expectedAnswer: 'VERIFY'
        }
      },
      {
        position: 7,
        kind: 'pixel_perfect_click',
        config: {
          difficulty: 5,
          targetX: 200,
          targetY: 150,
          tolerancePx: 2,
          decoyTargets: 8
        }
      },
      {
        position: 8,
        kind: 'looped_almost_done',
        config: {
          difficulty: 5,
          loopbackChance: 0.7,
          step: 'final',
          message: 'Final verification step...'
        }
      }
    ],
    edges: [
      {
        fromPosition: 8,
        toPosition: 3,
        condition: { loopback: true, chance: 0.7 }
      }
    ],
    settings: {
      theme: 'business',
      allowSkip: false,
      showHints: false,
      enableSounds: true,
      coverStory: COVER_STORIES.invoice.message
    }
  },
  
  {
    id: 'account-unlock',
    name: 'Account Unlock',
    description: 'Security verification with increased frustration elements',
    coverStory: COVER_STORIES.account.message,
    difficulty: 'hard',
    estimatedTimeWasted: '20-35 minutes',
    trials: [
      {
        position: 0,
        kind: 'captcha_loopback',
        config: {
          difficulty: 2,
          rule: 'select-numbers',
          expectedAnswer: '9437',
          mutationChance: 0.3
        }
      },
      {
        position: 1,
        kind: 'math_chain',
        config: {
          difficulty: 3,
          problems: [
            { question: '17 + 25', answer: 42 },
            { question: '42 × 2', answer: 84 },
            { question: '84 ÷ 4', answer: 21 }
          ],
          minDelayMs: 2000,
          delayGates: true
        }
      },
      {
        position: 2,
        kind: 'invisible_maze',
        config: {
          difficulty: 4,
          gridSize: [8, 8],
          startPos: [0, 0],
          endPos: [7, 7],
          requiredCues: 12,
          soundEnabled: true
        }
      },
      {
        position: 3,
        kind: 'document_review',
        config: {
          difficulty: 3,
          pages: 5,
          questionsPerPage: 2,
          expectedAnswers: {
            'security_policy': 'section_3',
            'data_retention': '90_days',
            'contact_method': 'email_only'
          }
        }
      },
      {
        position: 4,
        kind: 'keypress_combo',
        config: {
          difficulty: 5,
          sequence: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'],
          windowMs: 800,
          attempts: 3
        }
      },
      {
        position: 5,
        kind: 'video_frame_search',
        config: {
          difficulty: 4,
          videoLength: 120000,
          expectedWord: 'UNLOCK',
          expectedTimestamp: 87000,
          toleranceMs: 500,
          noSkipping: true
        }
      },
      {
        position: 6,
        kind: 'audio_gate',
        config: {
          difficulty: 4,
          duration: 60000,
          correctTimestamp: 23450,
          toleranceMs: 300,
          distractorSounds: true
        }
      },
      {
        position: 7,
        kind: 'multi_layer_captcha',
        config: {
          difficulty: 5,
          steps: [
            { type: 'rotate', expectedAnswer: 'upright' },
            { type: 'count', expectedAnswer: 7 },
            { type: 'sequence', expectedAnswer: 'ascending' }
          ],
          restartOnAnyFail: true
        }
      }
    ],
    edges: [
      {
        fromPosition: 7,
        toPosition: 1,
        condition: { loopback: true, chance: 0.6 }
      },
      {
        fromPosition: 4,
        toPosition: 2,
        condition: { onSuccess: false }
      }
    ],
    settings: {
      theme: 'security',
      allowSkip: false,
      showHints: false,
      enableSounds: true,
      coverStory: COVER_STORIES.account.message
    }
  },

  {
    id: 'prize-claim',
    name: 'Prize Claim',
    description: 'High-frustration prize verification with maximum time wasting',
    coverStory: COVER_STORIES.prize.message,
    difficulty: 'hard',
    estimatedTimeWasted: '25-45 minutes',
    trials: [
      {
        position: 0,
        kind: 'image_hunt',
        config: {
          difficulty: 2,
          tiles: 25,
          pattern: [3, 8, 12, 17, 21],
          instruction: 'Select all squares containing vehicles',
          minMs: 5000
        }
      },
      {
        position: 1,
        kind: 'slow_reveal',
        config: {
          difficulty: 3,
          revealMs: 60000,
          image: 'prize-code',
          expectedAnswer: 'WINNER2024',
          progressSteps: 20
        }
      },
      {
        position: 2,
        kind: 'loading_abyss',
        config: {
          minMs: 45000,
          resetOnBlur: true,
          message: 'Verifying prize eligibility...',
          checkpoints: [15000, 30000, 40000],
          fakeProgress: true
        }
      },
      {
        position: 3,
        kind: 'color_gradient_match',
        config: {
          difficulty: 5,
          targetColor: 'rgb(142, 156, 139)',
          gridSize: 12,
          similarColors: 20,
          timeLimit: 60000
        }
      },
      {
        position: 4,
        kind: 'pixel_perfect_click',
        config: {
          difficulty: 5,
          targetX: 157,
          targetY: 203,
          tolerancePx: 1,
          decoyTargets: 15,
          targetVisible: false
        }
      },
      {
        position: 5,
        kind: 'document_review',
        config: {
          difficulty: 4,
          pages: 8,
          questionsPerPage: 3,
          expectedAnswers: {
            'prize_value': '$500',
            'claim_deadline': '30_days',
            'tax_responsibility': 'winner',
            'shipping_time': '2_weeks',
            'verification_method': 'email_phone'
          }
        }
      },
      {
        position: 6,
        kind: 'keypress_combo',
        config: {
          difficulty: 5,
          sequence: ['KeyP', 'KeyR', 'KeyI', 'KeyZ', 'KeyE'],
          windowMs: 400,
          attempts: 2,
          caseSensitive: true
        }
      },
      {
        position: 7,
        kind: 'invisible_maze',
        config: {
          difficulty: 5,
          gridSize: [10, 10],
          startPos: [0, 0],
          endPos: [9, 9],
          requiredCues: 20,
          falseWalls: true
        }
      },
      {
        position: 8,
        kind: 'looped_almost_done',
        config: {
          difficulty: 5,
          loopbackChance: 0.8,
          step: 'final',
          message: 'Processing prize claim...',
          fakeSuccess: true
        }
      }
    ],
    edges: [
      {
        fromPosition: 8,
        toPosition: 2,
        condition: { loopback: true, chance: 0.8 }
      },
      {
        fromPosition: 6,
        toPosition: 4,
        condition: { onSuccess: false }
      }
    ],
    settings: {
      theme: 'prize',
      allowSkip: false,
      showHints: false,
      enableSounds: true,
      coverStory: COVER_STORIES.prize.message
    }
  }
];

// Helper function to get template by ID
export function getTemplateById(id: string): MazeTemplate | null {
  return MAZE_TEMPLATES.find(template => template.id === id) || null;
}

// Helper function to clone a template for customization
export function cloneTemplate(template: MazeTemplate): MazeTemplate {
  return JSON.parse(JSON.stringify(template));
}

// Helper function to get all available templates
export function getAllTemplates(): MazeTemplate[] {
  return [...MAZE_TEMPLATES];
}

// Helper function to get templates by difficulty
export function getTemplatesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): MazeTemplate[] {
  return MAZE_TEMPLATES.filter(template => template.difficulty === difficulty);
}