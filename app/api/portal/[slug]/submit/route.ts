import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { sessionId, trialId, answer, formData } = await request.json();

    // Verify session exists and is valid
    const session = await prisma.session.findUnique({
      where: { 
        id: sessionId,
        expiresAt: { gt: new Date() }
      },
      include: {
        maze: {
          include: {
            trials: {
              orderBy: { position: 'asc' }
            },
            edges: true
          }
        }
      }
    });

    if (!session || session.maze.slug !== slug) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' }, 
        { status: 401 }
      );
    }

    const currentTrial = session.maze.trials.find(t => t.id === trialId);
    if (!currentTrial) {
      return NextResponse.json(
        { success: false, error: 'Invalid trial' }, 
        { status: 400 }
      );
    }

    // Process the answer based on trial type
    const startTime = new Date();
    let isCorrect = false;
    let processingTime = 1000; // Base processing time

    switch (currentTrial.kind) {
      case 'image_hunt':
        // Always accept after some time - we want to waste their time
        isCorrect = answer && answer.length > 10;
        processingTime = 2000 + Math.random() * 3000;
        break;
        
      case 'form_fill':
        // Check if required fields are filled
        const config = currentTrial.config as any;
        const requiredFields = config.fields || [];
        isCorrect = requiredFields.every((field: string) => 
          formData[field] && formData[field].length > 0
        );
        processingTime = 1500 + Math.random() * 2000;
        break;
        
      case 'calculation':
        // Check math answer
        const problems = (currentTrial.config as any).problems || [];
        const currentProblem = problems[0];
        isCorrect = currentProblem && parseInt(answer) === currentProblem.answer;
        processingTime = 500 + Math.random() * 1000;
        break;
        
      case 'wait_timer':
        // Always succeeds after timer
        isCorrect = true;
        processingTime = 100;
        break;
        
      case 'captcha':
        // Randomly succeed/fail to frustrate user
        isCorrect = Math.random() > 0.3; // 70% success rate
        processingTime = 1000 + Math.random() * 2000;
        break;
        
      default:
        isCorrect = true;
        processingTime = 1000;
    }

    // Add deliberate delay to waste time
    await new Promise(resolve => setTimeout(resolve, processingTime));

    const endTime = new Date();

    // Record the event
    await prisma.event.create({
      data: {
        sessionId: session.id,
        trialId: currentTrial.id,
        startedAt: startTime,
        endedAt: endTime,
        outcome: isCorrect ? 'success' : 'fail',
        durationMs: endTime.getTime() - startTime.getTime(),
        hintsUsed: 0,
        retries: 0,
        meta: { answer, formData },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    });

    if (!isCorrect) {
      // Return error to make them retry
      const errorMessages = [
        'Please check your answer and try again.',
        'The information provided does not match our records.',
        'Security verification failed. Please retry.',
        'Invalid response detected. Please try again.',
      ];
      
      return NextResponse.json({
        success: false,
        error: errorMessages[Math.floor(Math.random() * errorMessages.length)]
      });
    }

    // Find next trial (or loop back)
    const currentIndex = session.maze.trials.findIndex(t => t.id === trialId);
    let nextTrialIndex = (currentIndex + 1) % session.maze.trials.length;
    
    // For loops, sometimes go back to earlier steps
    if (Math.random() < 0.3 && session.maze.trials.length > 2) {
      nextTrialIndex = Math.floor(Math.random() * Math.max(1, currentIndex));
    }
    
    const nextTrial = session.maze.trials[nextTrialIndex];
    
    // Update session progress
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        lastSeenAt: new Date(),
        actualStepsCompleted: { increment: 1 }
      }
    });

    const mazeData = {
      id: session.maze.id,
      name: session.maze.name,
      currentTrialId: nextTrial.id,
      currentTrial: {
        kind: nextTrial.kind,
        config: nextTrial.config
      },
      progress: {
        completed: Math.min(session.actualStepsCompleted + 1, session.maze.trials.length),
        total: session.maze.trials.length
      }
    };

    return NextResponse.json({
      success: true,
      maze: mazeData
    });

  } catch (error) {
    console.error('Portal submit error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed. Please try again.' }, 
      { status: 500 }
    );
  }
}