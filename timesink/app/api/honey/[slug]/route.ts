import { NextRequest, NextResponse } from 'next/server';
import { db, createSession, bucketIpAddress, hashUserAgent } from '@/lib/db';
import { redirect } from 'next/navigation';

function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const connectorIp = request.headers.get('x-connector-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIp || connectorIp || null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Find maze by slug
    const maze = await db.maze.findUnique({
      where: { 
        slug,
        status: 'published'
      }
    });

    if (!maze) {
      return NextResponse.json(
        { error: 'Verification link not found' },
        { status: 404 }
      );
    }

    // Get client information for privacy-preserving telemetry
    const clientIp = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || '';
    
    // Create new session
    const session = await createSession(
      maze.id,
      clientIp,
      userAgent
    );

    // Redirect to play page with session ID
    const playUrl = new URL(`/play/${session.id}`, request.url);
    return NextResponse.redirect(playUrl);

  } catch (error) {
    console.error('Error in honey URL handler:', error);
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status: 500 }
    );
  }
}

// Also handle POST for form submissions that might come to honey URLs
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  // Same logic as GET - redirect to play session
  return GET(request, { params });
}