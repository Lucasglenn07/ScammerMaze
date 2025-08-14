import { NextRequest, NextResponse } from 'next/server';
import { activeTimeTracker, validateHeartbeat } from '@/lib/activeTime';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate heartbeat data
    const heartbeatData = validateHeartbeat(body);
    if (!heartbeatData) {
      return NextResponse.json(
        { error: 'Invalid heartbeat data' },
        { status: 400 }
      );
    }

    // Check if session exists and is valid
    const session = await db.session.findUnique({
      where: { id: heartbeatData.sessionId }
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

    // Update active time
    const activeTimeAdded = activeTimeTracker.updateActivity(
      heartbeatData.sessionId, 
      heartbeatData
    );

    // Check for automation suspicion
    const isAutomationSuspected = activeTimeTracker.isAutomationSuspected(heartbeatData.sessionId);
    
    // Flag automation if suspected and not already flagged
    if (isAutomationSuspected) {
      const existingFlag = await db.flag.findFirst({
        where: {
          sessionId: heartbeatData.sessionId,
          reason: 'automation_suspected'
        }
      });

      if (!existingFlag) {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await db.flag.create({
          data: {
            sessionId: heartbeatData.sessionId,
            reason: 'automation_suspected',
            expiresAt
          }
        });
      }
    }

    // Update session last seen time
    await db.session.update({
      where: { id: heartbeatData.sessionId },
      data: { lastSeenAt: new Date() }
    });

    return NextResponse.json({
      ok: true,
      activeTimeAdded,
      isAutomationSuspected,
      totalActiveTime: activeTimeTracker.getActiveTime(heartbeatData.sessionId)
    });

  } catch (error) {
    console.error('Error in telemetry/heartbeat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}