import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
      userId: string;
    };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      );
    }

    // Get user's mazes
    const mazes = await prisma.maze.findMany({
      where: { userId },
      include: {
        sessions: {
          include: {
            events: true
          }
        }
      }
    });

    // Calculate stats
    const activeMazes = mazes.filter(maze => maze.status === 'published').length;
    const allSessions = mazes.flatMap(maze => maze.sessions);
    const totalSessions = allSessions.length;

    // Calculate total time wasted (sum of all session durations)
    let totalTimeWasted = 0;
    const recentSessions = [];

    for (const session of allSessions) {
      const sessionDuration = session.events.reduce((total, event) => total + event.durationMs, 0);
      totalTimeWasted += sessionDuration;
      
      const maze = mazes.find(m => m.id === session.mazeId);
      recentSessions.push({
        id: session.id,
        startedAt: session.startedAt.toISOString(),
        durationMs: sessionDuration,
        mazeName: maze?.name || 'Unknown Maze'
      });
    }

    // Sort recent sessions by date and take the latest 5
    recentSessions.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
    const limitedRecentSessions = recentSessions.slice(0, 5);

    // Calculate average session time
    const averageSessionTime = totalSessions > 0 ? Math.floor(totalTimeWasted / totalSessions) : 0;

    const stats = {
      totalTimeWasted,
      activeMazes,
      totalSessions,
      averageSessionTime,
      recentSessions: limitedRecentSessions
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}