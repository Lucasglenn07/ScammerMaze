import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Find the maze by slug
    const maze = await prisma.maze.findUnique({
      where: { 
        slug,
        status: 'published' // Only allow published mazes
      },
      include: {
        trials: {
          orderBy: { position: 'asc' }
        },
        edges: true
      }
    });

    if (!maze) {
      return NextResponse.json(
        { error: 'Verification portal not found' }, 
        { status: 404 }
      );
    }

    // Create a new session
    const session = await prisma.session.create({
      data: {
        mazeId: maze.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        // Get IP info from request headers
        ipCidr24: getIpFromRequest(request),
        uaHash: hashUserAgent(request.headers.get('user-agent') || ''),
      }
    });

    // Get the first trial
    const firstTrial = maze.trials[0];
    
    const mazeData = {
      id: maze.id,
      name: maze.name,
      currentTrialId: firstTrial?.id,
      currentTrial: firstTrial ? {
        kind: firstTrial.kind,
        config: firstTrial.config
      } : null,
      progress: {
        completed: 0,
        total: maze.trials.length
      }
    };

    return NextResponse.json({
      sessionId: session.id,
      maze: mazeData
    });

  } catch (error) {
    console.error('Portal start error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize verification portal' }, 
      { status: 500 }
    );
  }
}

function getIpFromRequest(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    const ip = forwarded.split(',')[0].trim();
    return ip.split('.').slice(0, 3).join('.') + '.0'; // Mask last octet
  }
  
  if (realIp) {
    return realIp.split('.').slice(0, 3).join('.') + '.0';
  }
  
  return '0.0.0.0';
}

function hashUserAgent(userAgent: string): string {
  // Simple hash function for user agent
  let hash = 0;
  for (let i = 0; i < userAgent.length; i++) {
    const char = userAgent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}