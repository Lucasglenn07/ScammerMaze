import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// S3/R2 Client configuration
const s3Client = new S3Client({
  region: process.env.S3_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET || 'timesink-data';
const CHUNK_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB chunks

export interface RRWebEvent {
  type: number;
  data: any;
  timestamp: number;
}

export interface RecordingChunk {
  sessionId: string;
  chunkId: string;
  events: RRWebEvent[];
  startTime: number;
  endTime: number;
  sizeBytes: number;
}

export class RRWebManager {
  private pendingChunks = new Map<string, RRWebEvent[]>();
  private chunkStartTimes = new Map<string, number>();

  async addEvents(sessionId: string, events: RRWebEvent[]): Promise<void> {
    const existing = this.pendingChunks.get(sessionId) || [];
    existing.push(...events);
    
    if (!this.chunkStartTimes.has(sessionId)) {
      this.chunkStartTimes.set(sessionId, Date.now());
    }

    // Check if chunk should be flushed
    const estimatedSize = this.estimateChunkSize(existing);
    if (estimatedSize >= CHUNK_SIZE_LIMIT || existing.length >= 1000) {
      await this.flushChunk(sessionId);
    } else {
      this.pendingChunks.set(sessionId, existing);
    }
  }

  async flushChunk(sessionId: string): Promise<string | null> {
    const events = this.pendingChunks.get(sessionId);
    if (!events || events.length === 0) {
      return null;
    }

    const chunkId = uuidv4();
    const startTime = this.chunkStartTimes.get(sessionId) || Date.now();
    const endTime = Date.now();

    const chunk: RecordingChunk = {
      sessionId,
      chunkId,
      events,
      startTime,
      endTime,
      sizeBytes: this.estimateChunkSize(events),
    };

    // Upload to S3/R2
    const key = `sessions/${sessionId}/rrweb/${chunkId}.json`;
    const uri = await this.uploadChunk(key, chunk);

    // Store artifact record
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.artifact.create({
      data: {
        sessionId,
        kind: 'rrweb_blob',
        uri,
        sizeBytes: chunk.sizeBytes,
        expiresAt,
      },
    });

    // Clear pending data
    this.pendingChunks.delete(sessionId);
    this.chunkStartTimes.delete(sessionId);

    return uri;
  }

  private async uploadChunk(key: string, chunk: RecordingChunk): Promise<string> {
    const body = JSON.stringify(chunk);
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: 'application/json',
      Metadata: {
        sessionId: chunk.sessionId,
        chunkId: chunk.chunkId,
        startTime: chunk.startTime.toString(),
        endTime: chunk.endTime.toString(),
      },
    });

    await s3Client.send(command);
    
    // Return the full URI
    const endpoint = process.env.S3_ENDPOINT || '';
    return `${endpoint}/${BUCKET_NAME}/${key}`;
  }

  private estimateChunkSize(events: RRWebEvent[]): number {
    // Rough estimation - JSON.stringify would be more accurate but expensive
    return events.length * 500; // Average 500 bytes per event
  }

  async getRecordingChunks(sessionId: string): Promise<RecordingChunk[]> {
    const artifacts = await prisma.artifact.findMany({
      where: {
        sessionId,
        kind: 'rrweb_blob',
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const chunks: RecordingChunk[] = [];
    
    for (const artifact of artifacts) {
      try {
        const chunk = await this.downloadChunk(artifact.uri);
        if (chunk) {
          chunks.push(chunk);
        }
      } catch (error) {
        console.error(`Failed to download chunk ${artifact.uri}:`, error);
      }
    }

    return chunks;
  }

  private async downloadChunk(uri: string): Promise<RecordingChunk | null> {
    try {
      // Extract key from URI
      const url = new URL(uri);
      const key = url.pathname.substring(1).replace(`${BUCKET_NAME}/`, '');

      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const response = await s3Client.send(command);
      const body = await response.Body?.transformToString();
      
      if (!body) {
        return null;
      }

      return JSON.parse(body) as RecordingChunk;
    } catch {
      return null;
    }
  }

  async cleanup(sessionId: string): Promise<void> {
    // Clear pending data
    this.pendingChunks.delete(sessionId);
    this.chunkStartTimes.delete(sessionId);

    // Note: S3 objects will be cleaned up by lifecycle policy
    // or by the scheduled cleanup job
  }

  // Force flush all pending chunks (useful for session end)
  async flushAllPending(): Promise<void> {
    const sessionIds = Array.from(this.pendingChunks.keys());
    
    for (const sessionId of sessionIds) {
      try {
        await this.flushChunk(sessionId);
      } catch (error) {
        console.error(`Failed to flush chunk for session ${sessionId}:`, error);
      }
    }
  }
}

// Global instance
export const rrwebManager = new RRWebManager();

// Utility to validate rrweb events
export function validateRRWebEvents(events: any[]): RRWebEvent[] {
  const validEvents: RRWebEvent[] = [];

  for (const event of events) {
    if (
      typeof event === 'object' &&
      typeof event.type === 'number' &&
      typeof event.timestamp === 'number' &&
      event.data !== undefined
    ) {
      validEvents.push({
        type: event.type,
        data: event.data,
        timestamp: event.timestamp,
      });
    }
  }

  return validEvents;
}