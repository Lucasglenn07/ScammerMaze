import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredData } from '@/lib/db';
import { S3Client, DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

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

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting cleanup job...');

    // Clean up database records
    const dbCleanupResult = await cleanupExpiredData();
    
    // Clean up S3/R2 objects
    const s3CleanupResult = await cleanupExpiredS3Objects();

    console.log('Cleanup completed:', {
      database: dbCleanupResult,
      storage: s3CleanupResult
    });

    return NextResponse.json({
      success: true,
      cleanup: {
        database: dbCleanupResult,
        storage: s3CleanupResult
      }
    });

  } catch (error) {
    console.error('Cleanup job failed:', error);
    return NextResponse.json(
      { error: 'Cleanup job failed' },
      { status: 500 }
    );
  }
}

async function cleanupExpiredS3Objects(): Promise<{
  scanned: number;
  deleted: number;
  errors: number;
}> {
  let scanned = 0;
  let deleted = 0;
  let errors = 0;

  try {
    // List all objects in the sessions prefix
    let continuationToken: string | undefined;
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: 'sessions/',
        ContinuationToken: continuationToken,
        MaxKeys: 1000
      });

      const listResponse = await s3Client.send(listCommand);
      
      if (listResponse.Contents) {
        scanned += listResponse.Contents.length;
        
        // Filter objects older than 7 days
        const expiredObjects = listResponse.Contents.filter(obj => 
          obj.LastModified && obj.LastModified < cutoffDate
        );

        if (expiredObjects.length > 0) {
          // Delete in batches of 1000 (S3 limit)
          const objectsToDelete = expiredObjects.slice(0, 1000).map(obj => ({
            Key: obj.Key!
          }));

          try {
            const deleteCommand = new DeleteObjectsCommand({
              Bucket: BUCKET_NAME,
              Delete: {
                Objects: objectsToDelete,
                Quiet: true
              }
            });

            const deleteResponse = await s3Client.send(deleteCommand);
            
            deleted += objectsToDelete.length;
            
            if (deleteResponse.Errors) {
              errors += deleteResponse.Errors.length;
              console.error('S3 delete errors:', deleteResponse.Errors);
            }
          } catch (deleteError) {
            console.error('Error deleting S3 objects:', deleteError);
            errors += objectsToDelete.length;
          }
        }
      }

      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);

  } catch (error) {
    console.error('Error listing S3 objects:', error);
    errors++;
  }

  return { scanned, deleted, errors };
}

// Manual trigger endpoint for testing
export async function POST(request: NextRequest) {
  try {
    // Verify authorization for manual trigger
    const { secret } = await request.json();
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Run the same cleanup logic as the cron job
    const dbCleanupResult = await cleanupExpiredData();
    const s3CleanupResult = await cleanupExpiredS3Objects();

    return NextResponse.json({
      success: true,
      manual: true,
      cleanup: {
        database: dbCleanupResult,
        storage: s3CleanupResult
      }
    });

  } catch (error) {
    console.error('Manual cleanup failed:', error);
    return NextResponse.json(
      { error: 'Manual cleanup failed' },
      { status: 500 }
    );
  }
}