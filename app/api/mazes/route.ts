import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

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

const mazeSchema = z.object({
  name: z.string().min(1),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
  settings: z.object({
    allowRestart: z.boolean(),
    trackTime: z.boolean(),
    captureScreenshots: z.boolean(),
  }),
});

// Create new maze
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, nodes, edges, settings } = mazeSchema.parse(body);

    // Generate a unique slug
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').trim('-');
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const slug = `${baseSlug}-${randomSuffix}`;

    // Convert nodes and edges to database format
    const trials = nodes
      .filter(node => node.type === 'taskNode')
      .map((node, index) => ({
        kind: node.data.taskType,
        position: index,
        config: {
          ...node.data.config,
          label: node.data.label,
          difficulty: node.data.difficulty,
          nodeId: node.id,
          position: node.position,
        },
      }));

    // Create maze in database
    const maze = await prisma.maze.create({
      data: {
        userId,
        name,
        slug,
        settings: settings as any,
        status: 'draft',
        trials: {
          create: trials,
        },
        edges: {
          create: edges.map(edge => ({
            fromTrialId: edge.source,
            toTrialId: edge.target,
            condition: { type: 'default' } as any,
          })),
        },
      },
      include: {
        trials: true,
        edges: true,
      },
    });

    return NextResponse.json({
      id: maze.id,
      slug: maze.slug,
      name: maze.name,
      status: maze.status,
    });

  } catch (error) {
    console.error('Maze creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create maze' }, 
      { status: 500 }
    );
  }
}

// Get user's mazes
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserFromToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' }, 
        { status: 401 }
      );
    }

    const mazes = await prisma.maze.findMany({
      where: { userId },
      include: {
        trials: true,
        sessions: {
          take: 5,
          orderBy: { startedAt: 'desc' },
        },
        _count: {
          select: {
            sessions: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(mazes);

  } catch (error) {
    console.error('Maze fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mazes' }, 
      { status: 500 }
    );
  }
}