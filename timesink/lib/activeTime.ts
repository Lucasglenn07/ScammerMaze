export interface ActivityData {
  visibilityMs: number;
  inputEvents: number;
  timingVariance: number;
  isVisible: boolean;
  lastActivity: number;
}

export interface HeartbeatData {
  sessionId: string;
  isVisible: boolean;
  inputEvents: number;
  timestamp: number;
  timeSinceLastActivity: number;
}

const MINIMUM_INPUT_THRESHOLD = 5; // Minimum input events to count as active
const AUTOMATION_TIMING_THRESHOLD = 0.1; // Low variance indicates automation
const HEARTBEAT_INTERVAL = 5000; // 5 seconds

export class ActiveTimeTracker {
  private sessions = new Map<string, ActivityData>();

  updateActivity(sessionId: string, heartbeat: HeartbeatData): number {
    const existing = this.sessions.get(sessionId) || {
      visibilityMs: 0,
      inputEvents: 0,
      timingVariance: 0,
      isVisible: false,
      lastActivity: Date.now()
    };

    const now = Date.now();
    const timeDelta = now - existing.lastActivity;

    // Only count time if visible and has sufficient input
    let activeTimeToAdd = 0;
    if (heartbeat.isVisible && heartbeat.inputEvents >= MINIMUM_INPUT_THRESHOLD) {
      // Calculate timing variance for automation detection
      const expectedInterval = HEARTBEAT_INTERVAL;
      const variance = Math.abs(timeDelta - expectedInterval) / expectedInterval;
      
      // Update variance using exponential moving average
      existing.timingVariance = existing.timingVariance * 0.8 + variance * 0.2;
      
      // Apply automation discount if timing is too regular
      const automationDiscount = existing.timingVariance < AUTOMATION_TIMING_THRESHOLD ? 0.3 : 1.0;
      
      activeTimeToAdd = Math.min(timeDelta, HEARTBEAT_INTERVAL) * automationDiscount;
      existing.visibilityMs += activeTimeToAdd;
    }

    // Update tracking data
    existing.inputEvents = heartbeat.inputEvents;
    existing.isVisible = heartbeat.isVisible;
    existing.lastActivity = now;

    this.sessions.set(sessionId, existing);

    return Math.floor(activeTimeToAdd);
  }

  getActiveTime(sessionId: string): number {
    const data = this.sessions.get(sessionId);
    return data ? Math.floor(data.visibilityMs) : 0;
  }

  isAutomationSuspected(sessionId: string): boolean {
    const data = this.sessions.get(sessionId);
    return data ? data.timingVariance < AUTOMATION_TIMING_THRESHOLD : false;
  }

  cleanup(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  // Get stats for analysis
  getActivityStats(sessionId: string): ActivityData | null {
    return this.sessions.get(sessionId) || null;
  }
}

// Global instance
export const activeTimeTracker = new ActiveTimeTracker();

export function validateHeartbeat(data: any): HeartbeatData | null {
  try {
    const { sessionId, isVisible, inputEvents, timestamp } = data;
    
    if (!sessionId || typeof isVisible !== 'boolean' || 
        typeof inputEvents !== 'number' || typeof timestamp !== 'number') {
      return null;
    }

    const now = Date.now();
    const timeSinceLastActivity = now - timestamp;

    // Reject heartbeats that are too old or from the future
    if (timeSinceLastActivity < 0 || timeSinceLastActivity > 60000) {
      return null;
    }

    return {
      sessionId,
      isVisible,
      inputEvents,
      timestamp,
      timeSinceLastActivity
    };
  } catch {
    return null;
  }
}