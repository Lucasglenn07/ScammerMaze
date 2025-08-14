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

function getDateRange(range: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (range) {
    case '24h':
      start.setHours(start.getHours() - 24);
      break;
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start.setDate(start.getDate() - 90);
      break;
    default:
      start.setDate(start.getDate() - 7);
  }

  return { start, end };
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

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';
    const mazeFilter = searchParams.get('maze') || 'all';
    
    const { start, end } = getDateRange(range);

    // Get user's mazes
    const userMazes = await prisma.maze.findMany({
      where: { userId },
      select: { id: true, name: true }
    });

    const mazeIds = userMazes.map(m => m.id);
    if (mazeIds.length === 0) {
      // Return empty analytics if user has no mazes
      return NextResponse.json({
        overview: {
          totalSessions: 0,
          totalTimeWasted: 0,
          averageSessionDuration: 0,
          completionRate: 0,
          uniqueIPs: 0,
          topCountries: []
        },
        chartData: {
          sessionsOverTime: [],
          trialPerformance: [],
          deviceTypes: [],
          hourlyActivity: []
        },
        recentSessions: []
      });
    }

    // Apply maze filter
    const filteredMazeIds = mazeFilter === 'all' 
      ? mazeIds 
      : mazeIds.filter(id => id === mazeFilter);

    // Get sessions in date range
    const sessions = await prisma.session.findMany({
      where: {
        mazeId: { in: filteredMazeIds },
        startedAt: { gte: start, lte: end }
      },
      include: {
        maze: { select: { name: true } },
        events: true
      },
      orderBy: { startedAt: 'desc' }
    });

    // Calculate overview stats
    const totalSessions = sessions.length;
    const uniqueIPs = new Set(sessions.map(s => s.ipCidr24).filter(Boolean)).size;
    
    let totalTimeWasted = 0;
    let completedSessions = 0;

    const sessionData = sessions.map(session => {
      const sessionDuration = session.events.reduce((total, event) => total + event.durationMs, 0);
      totalTimeWasted += sessionDuration;
      
      if (session.status === 'completed') {
        completedSessions++;
      }

      return {
        ...session,
        duration: sessionDuration,
        country: getCountryFromIP(session.ipCidr24 || ''),
        device: getDeviceType(session.uaHash || ''),
        completedSteps: session.actualStepsCompleted,
        totalSteps: session.maze ? 5 : 0, // Default to 5 for now
        mazeName: session.maze?.name || 'Unknown'
      };
    });

    const averageSessionDuration = totalSessions > 0 ? totalTimeWasted / totalSessions : 0;
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    // Get top countries
    const countryCount = sessionData.reduce((acc, session) => {
      acc[session.country] = (acc[session.country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCountries = Object.entries(countryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([country, sessions]) => ({ country, sessions }));

    // Get sessions over time
    const sessionsOverTime = generateTimeSeriesData(sessions, start, end, range);

    // Get trial performance data
    const trialPerformance = await getTrialPerformance(filteredMazeIds, start, end);

    // Get device types
    const deviceTypes = sessionData.reduce((acc, session) => {
      acc[session.device] = (acc[session.device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const deviceTypesArray = Object.entries(deviceTypes)
      .map(([type, count]) => ({ type, count }));

    // Get hourly activity
    const hourlyActivity = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      sessions: sessions.filter(s => new Date(s.startedAt).getHours() === hour).length
    }));

    return NextResponse.json({
      overview: {
        totalSessions,
        totalTimeWasted,
        averageSessionDuration,
        completionRate,
        uniqueIPs,
        topCountries
      },
      chartData: {
        sessionsOverTime,
        trialPerformance,
        deviceTypes: deviceTypesArray,
        hourlyActivity
      },
      recentSessions: sessionData.slice(0, 20).map(session => ({
        id: session.id,
        startedAt: session.startedAt.toISOString(),
        duration: session.duration,
        country: session.country,
        device: session.device,
        completedSteps: session.completedSteps,
        totalSteps: session.totalSteps,
        mazeName: session.mazeName,
        status: session.status
      }))
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to load analytics' }, 
      { status: 500 }
    );
  }
}

function generateTimeSeriesData(sessions: any[], start: Date, end: Date, range: string) {
  const data = [];
  const current = new Date(start);
  const increment = range === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 1 hour or 1 day

  while (current <= end) {
    const nextPeriod = new Date(current.getTime() + increment);
    const periodSessions = sessions.filter(s => 
      new Date(s.startedAt) >= current && new Date(s.startedAt) < nextPeriod
    );

    const timeWasted = periodSessions.reduce((total, session) => {
      return total + session.events.reduce((eventTotal: number, event: any) => eventTotal + event.durationMs, 0);
    }, 0);

    data.push({
      date: current.toISOString(),
      sessions: periodSessions.length,
      timeWasted
    });

    current.setTime(current.getTime() + increment);
  }

  return data;
}

async function getTrialPerformance(mazeIds: string[], start: Date, end: Date) {
  const events = await prisma.event.findMany({
    where: {
      session: {
        mazeId: { in: mazeIds },
        startedAt: { gte: start, lte: end }
      }
    },
    include: {
      session: {
        include: {
          maze: {
            include: {
              trials: true
            }
          }
        }
      }
    }
  });

  const trialStats = events.reduce((acc, event) => {
    if (!event.trialId) return acc;

    const trial = event.session.maze.trials.find(t => t.id === event.trialId);
    const trialName = trial ? (trial.config as any)?.label || trial.kind : 'Unknown';

    if (!acc[trialName]) {
      acc[trialName] = {
        attempts: 0,
        successes: 0,
        totalTime: 0,
        exits: 0
      };
    }

    acc[trialName].attempts++;
    acc[trialName].totalTime += event.durationMs;
    
    if (event.outcome === 'success') {
      acc[trialName].successes++;
    }
    
    if (event.outcome === 'abandon') {
      acc[trialName].exits++;
    }

    return acc;
  }, {} as Record<string, any>);

  return Object.entries(trialStats).map(([trialName, stats]) => ({
    trialName,
    attempts: stats.attempts,
    successRate: stats.attempts > 0 ? (stats.successes / stats.attempts) * 100 : 0,
    averageTime: stats.attempts > 0 ? stats.totalTime / stats.attempts : 0,
    exitRate: stats.attempts > 0 ? (stats.exits / stats.attempts) * 100 : 0
  }));
}

function getCountryFromIP(ip: string): string {
  // Simplified country detection - in real implementation, use a GeoIP service
  const countryMap: Record<string, string> = {
    '192.168.': 'Local',
    '10.0.': 'Local',
    '172.16.': 'Local',
    '127.0.': 'Local'
  };

  for (const [prefix, country] of Object.entries(countryMap)) {
    if (ip.startsWith(prefix)) return country;
  }

  // Mock some countries based on IP patterns
  const hash = ip.split('.').reduce((sum, part) => sum + parseInt(part || '0'), 0);
  const countries = ['United States', 'India', 'Nigeria', 'Philippines', 'Romania', 'Ukraine', 'Brazil'];
  return countries[hash % countries.length];
}

function getDeviceType(uaHash: string): string {
  // Simplified device detection based on hash
  const hash = parseInt(uaHash, 36) || 0;
  const devices = ['Desktop', 'Mobile', 'Tablet'];
  return devices[hash % devices.length];
}