import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { mazeEngine } from '@/lib/mazeEngine';
import { createStepToken } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get session from database
    const session = await db.session.findUnique({
      where: { id: sessionId },
      include: { maze: true }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
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

    // Initialize or get next trial from maze engine
    await mazeEngine.initializeSession(sessionId, session.mazeId);
    const nextTrialResult = await mazeEngine.getNextTrial(sessionId);

    // Handle restart condition
    if (nextTrialResult.shouldRestart) {
      await mazeEngine.restartSession(sessionId);
      
      return NextResponse.json({
        shouldRestart: true,
        message: "(>1 of 20) answers incorrect, please try again",
        displayProgress: nextTrialResult.displayProgress
      });
    }

    // Handle completion
    if (nextTrialResult.isComplete) {
      return NextResponse.json({
        isComplete: true,
        message: "Verification process completed",
        displayProgress: nextTrialResult.displayProgress
      });
    }

    // Get trial data
    const trial = nextTrialResult.trial;
    if (!trial) {
      return NextResponse.json(
        { error: 'No trial available' },
        { status: 500 }
      );
    }

    // Generate step token
    const stepToken = await createStepToken(sessionId, trial.id, session.actualStepsCompleted);

    // Update session last seen
    await db.session.update({
      where: { id: sessionId },
      data: { lastSeenAt: new Date() }
    });

    return NextResponse.json({
      trial: {
        id: trial.id,
        kind: trial.kind,
        config: trial.config,
        position: trial.position
      },
      newToken: stepToken,
      displayProgress: nextTrialResult.displayProgress,
      sessionStatus: session.status
    });

  } catch (error) {
    console.error('Error in maze-runtime/next:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}