import { PrismaClient, Trial, Edge } from '@prisma/client';

const prisma = new PrismaClient();

export interface MazeState {
  sessionId: string;
  mazeId: string;
  currentTrialId: string | null;
  completedTrials: string[];
  actualStepsCompleted: number;
  isRestarted: boolean;
}

export interface NextTrialResult {
  trial: Trial | null;
  isComplete: boolean;
  shouldRestart: boolean;
  displayProgress: number;
}

export class MazeEngine {
  private states = new Map<string, MazeState>();

  async initializeSession(sessionId: string, mazeId: string): Promise<void> {
    // Get the first trial (position = 0)
    const firstTrial = await prisma.trial.findFirst({
      where: { mazeId, position: 0 }
    });

    this.states.set(sessionId, {
      sessionId,
      mazeId,
      currentTrialId: firstTrial?.id || null,
      completedTrials: [],
      actualStepsCompleted: 0,
      isRestarted: false
    });
  }

  async getNextTrial(sessionId: string): Promise<NextTrialResult> {
    const state = this.states.get(sessionId);
    if (!state) {
      throw new Error('Session not initialized');
    }

    // Check if we've completed 20 trials (restart condition)
    if (state.actualStepsCompleted >= 20) {
      return {
        trial: null,
        isComplete: false,
        shouldRestart: true,
        displayProgress: this.calculateDisplayProgress(state.actualStepsCompleted)
      };
    }

    // If no current trial, maze is complete
    if (!state.currentTrialId) {
      return {
        trial: null,
        isComplete: true,
        shouldRestart: false,
        displayProgress: this.calculateDisplayProgress(state.actualStepsCompleted)
      };
    }

    const trial = await prisma.trial.findUnique({
      where: { id: state.currentTrialId }
    });

    return {
      trial,
      isComplete: false,
      shouldRestart: false,
      displayProgress: this.calculateDisplayProgress(state.actualStepsCompleted)
    };
  }

  async completeCurrentTrial(sessionId: string, success: boolean = true): Promise<string | null> {
    const state = this.states.get(sessionId);
    if (!state || !state.currentTrialId) {
      return null;
    }

    // Mark trial as completed
    if (success && !state.completedTrials.includes(state.currentTrialId)) {
      state.completedTrials.push(state.currentTrialId);
      state.actualStepsCompleted++;
    }

    // Find next trial based on edges and conditions
    const nextTrialId = await this.determineNextTrial(
      state.mazeId, 
      state.currentTrialId, 
      success,
      state.completedTrials
    );

    state.currentTrialId = nextTrialId;
    this.states.set(sessionId, state);

    return nextTrialId;
  }

  async restartSession(sessionId: string): Promise<void> {
    const state = this.states.get(sessionId);
    if (!state) {
      throw new Error('Session not initialized');
    }

    // Reset to first trial
    const firstTrial = await prisma.trial.findFirst({
      where: { mazeId: state.mazeId, position: 0 }
    });

    state.currentTrialId = firstTrial?.id || null;
    state.completedTrials = [];
    state.actualStepsCompleted = 0;
    state.isRestarted = true;

    this.states.set(sessionId, state);

    // Update session in database
    await prisma.session.update({
      where: { id: sessionId },
      data: { 
        status: 'restarted',
        actualStepsCompleted: 0
      }
    });
  }

  private async determineNextTrial(
    mazeId: string, 
    currentTrialId: string, 
    success: boolean,
    completedTrials: string[]
  ): Promise<string | null> {
    // Get all edges from current trial
    const edges = await prisma.edge.findMany({
      where: { 
        mazeId,
        fromTrialId: currentTrialId 
      }
    });

    // If no edges, check for next sequential trial
    if (edges.length === 0) {
      const currentTrial = await prisma.trial.findUnique({
        where: { id: currentTrialId }
      });
      
      if (currentTrial) {
        const nextTrial = await prisma.trial.findFirst({
          where: { 
            mazeId,
            position: currentTrial.position + 1
          }
        });
        return nextTrial?.id || null;
      }
      return null;
    }

    // Evaluate edge conditions
    for (const edge of edges) {
      if (this.evaluateEdgeCondition(edge.condition, success, completedTrials)) {
        return edge.toTrialId;
      }
    }

    // Fallback to next sequential trial
    const currentTrial = await prisma.trial.findUnique({
      where: { id: currentTrialId }
    });
    
    if (currentTrial) {
      const nextTrial = await prisma.trial.findFirst({
        where: { 
          mazeId,
          position: currentTrial.position + 1
        }
      });
      return nextTrial?.id || null;
    }

    return null;
  }

  private evaluateEdgeCondition(condition: any, success: boolean, completedTrials: string[]): boolean {
    try {
      const cond = typeof condition === 'string' ? JSON.parse(condition) : condition;
      
      // Check success/failure condition
      if (cond.onSuccess !== undefined && success !== cond.onSuccess) {
        return false;
      }

      // Check loopback condition with chance
      if (cond.loopback && typeof cond.chance === 'number') {
        return Math.random() < cond.chance;
      }

      // Check minimum completed trials
      if (cond.minCompleted && completedTrials.length < cond.minCompleted) {
        return false;
      }

      // Default to true if no specific conditions
      return true;
    } catch {
      return false;
    }
  }

  private calculateDisplayProgress(actualStepsCompleted: number): number {
    // Progress illusion: show 1-10, then loop
    return (actualStepsCompleted % 10) || 10;
  }

  getSessionState(sessionId: string): MazeState | null {
    return this.states.get(sessionId) || null;
  }

  cleanupSession(sessionId: string): void {
    this.states.delete(sessionId);
  }
}

// Global instance
export const mazeEngine = new MazeEngine();