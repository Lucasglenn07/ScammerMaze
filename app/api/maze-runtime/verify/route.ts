import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mazeEngine } from '@/lib/mazeEngine';
import { verifyMazeToken, createStepToken } from '@/lib/tokens';
import { validateTrialAnswer } from '@/lib/validate';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, token, trialId, answer } = await request.json();

    if (!sessionId || !token || !trialId || answer === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify token
    const tokenData = await verifyMazeToken(token);
    if (!tokenData || tokenData.sessionId !== sessionId || tokenData.trialId !== trialId) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get session and trial
    const [session, trial] = await Promise.all([
      db.session.findUnique({
        where: { id: sessionId },
        include: { maze: true }
      }),
      db.trial.findUnique({
        where: { id: trialId }
      })
    ]);

    if (!session || !trial) {
      return NextResponse.json(
        { error: 'Session or trial not found' },
        { status: 404 }
      );
    }

    // Check if session has expired
    if (session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Session has expired' },
        { status: 410 }
      );
    }

    // Validate the answer
    const validationResult = validateTrialAnswer(trial.kind, answer, trial.config);
    
    // Record the event
    const eventStartTime = new Date(Date.now() - (answer.duration || 0));
    const eventEndTime = new Date();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.event.create({
      data: {
        sessionId,
        trialId,
        startedAt: eventStartTime,
        endedAt: eventEndTime,
        outcome: validationResult.success ? 'success' : 'fail',
        durationMs: answer.duration || 0,
        hintsUsed: answer.hintsUsed || 0,
        retries: answer.retries || 0,
        meta: answer.meta || {},
        expiresAt
      }
    });

    // Handle validation result
    if (validationResult.success) {
      // Complete the trial in maze engine
      await mazeEngine.completeCurrentTrial(sessionId, true);
      
      // Update session step count
      await db.session.update({
        where: { id: sessionId },
        data: { 
          actualStepsCompleted: { increment: 1 },
          lastSeenAt: new Date()
        }
      });

      // Get next trial
      const nextTrialResult = await mazeEngine.getNextTrial(sessionId);
      
      // Check if we need to restart (hit the 20 step limit)
      if (nextTrialResult.shouldRestart) {
        await mazeEngine.restartSession(sessionId);
        
        return NextResponse.json({
          outcome: 'restart',
          message: "(>1 of 20) answers incorrect, please try again",
          displayProgress: nextTrialResult.displayProgress,
          shouldRestart: true
        });
      }

      // Generate new token for next step
      let nextToken = null;
      if (nextTrialResult.trial) {
        nextToken = await createStepToken(sessionId, nextTrialResult.trial.id, session.actualStepsCompleted + 1);
      }

      return NextResponse.json({
        outcome: 'success',
        nextToken,
        displayProgress: nextTrialResult.displayProgress,
        isComplete: nextTrialResult.isComplete
      });

    } else {
      // Handle failure
      await mazeEngine.completeCurrentTrial(sessionId, false);

      // Check if we should restart due to validation failure
      if (validationResult.restartOnFail) {
        await mazeEngine.restartSession(sessionId);
        
        return NextResponse.json({
          outcome: 'restart',
          reason: validationResult.reason,
          message: validationResult.reason || "Verification failed, please start over",
          displayProgress: 1, // Reset to beginning
          shouldRestart: true
        });
      }

      // Regular failure - retry current step
      const currentTrialResult = await mazeEngine.getNextTrial(sessionId);
      const retryToken = await createStepToken(sessionId, trialId, session.actualStepsCompleted);

      return NextResponse.json({
        outcome: 'fail',
        reason: validationResult.reason,
        nextToken: retryToken,
        displayProgress: currentTrialResult.displayProgress
      });
    }

  } catch (error) {
    console.error('Error in maze-runtime/verify:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}