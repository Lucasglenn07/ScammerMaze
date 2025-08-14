import { NextRequest, NextResponse } from 'next/server';
import { rrwebManager, validateRRWebEvents } from '@/lib/rrweb';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, events } = await request.json();

    if (!sessionId || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Session ID and events array are required' },
        { status: 400 }
      );
    }

    // Check if session exists and is valid
    const session = await db.session.findUnique({
      where: { id: sessionId }
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

    // Validate and sanitize events
    const validEvents = validateRRWebEvents(events);
    
    if (validEvents.length === 0) {
      return NextResponse.json(
        { error: 'No valid events provided' },
        { status: 400 }
      );
    }

    // Add events to rrweb manager (will batch and upload to S3/R2)
    await rrwebManager.addEvents(sessionId, validEvents);

    // Update session last seen time
    await db.session.update({
      where: { id: sessionId },
      data: { lastSeenAt: new Date() }
    });

    return NextResponse.json({
      ok: true,
      eventsProcessed: validEvents.length,
      uri: null // URI will be available after chunk is flushed
    });

  } catch (error) {
    console.error('Error in telemetry/rrweb:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle chunk flushing endpoint
export async function PUT(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Force flush pending chunks for this session
    const uri = await rrwebManager.flushChunk(sessionId);

    return NextResponse.json({
      ok: true,
      uri,
      flushed: !!uri
    });

  } catch (error) {
    console.error('Error in telemetry/rrweb flush:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}