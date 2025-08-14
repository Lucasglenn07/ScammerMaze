# TimeSink - Scammer Maze Web App

TimeSink is a web application for creating and deploying "mazes" designed to waste scammers' time. Users create verification workflows with deliberately frustrating elements, then share honey URLs that lead scammers through time-consuming tasks.

## Features

### Core Functionality
- **Maze Builder**: Drag-and-drop interface for creating custom verification flows
- **16 Trial Types**: From simple image selection to complex multi-layer puzzles
- **Progress Illusion**: Shows "1-10 complete" while actually requiring 20+ steps
- **Honey URLs**: Public entry points (`/honey/[slug]`) for scammers
- **Session Recording**: Full rrweb session replay capability
- **Time Tracking**: Accurate active time measurement with automation detection
- **7-Day Retention**: Automatic data cleanup after 7 days

### Privacy & Ethics
- **No PII Collection**: IPs bucketed to /24 (IPv4) or /48 (IPv6)
- **Hashed User Agents**: No raw browser fingerprints stored
- **Automatic Cleanup**: All data auto-deleted after 7 days
- **Abuse Deterrence**: Clear footer indicating research purpose

### Trial Types Implemented

**Baseline Trials:**
1. **Image Hunt** - Pattern tile selection with minimum time requirements
2. **Drag Sum** - Combine numbers to exact target with item count restrictions
3. **Loading Abyss** - Extended fake progress with blur detection
4. **Multi-Layer Captcha** - 3-step verification that restarts on any failure
5. **Trace Path** - Canvas path tracing with velocity validation
6. **Audio Gate** - Timestamp-based audio interaction

**High-Frustration Trials:**
7. **Color Gradient Match** - Exact RGB matching among similar colors
8. **Pixel Perfect Click** - Hidden targets with ±3px tolerance
9. **Slow Reveal** - 60+ second image reveal before solvable
10. **Invisible Maze** - Navigate by sound cues only
11. **Math Chain** - Sequential problems with mandatory delays
12. **Document Review** - Scroll through pages to find buried answers
13. **Keypress Combo** - Timed key sequences with ±50ms windows
14. **Video Frame Search** - Find specific timestamps without skipping
15. **Captcha Loopback** - Rule mutations that reset progress
16. **Looped Almost Done** - 50%+ failure rate on final steps

## Setup Instructions

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database
- Redis instance
- S3-compatible storage (Cloudflare R2 recommended)
- SMTP server for email authentication

### 1. Clone and Install
```bash
git clone <repository-url>
cd timesink
pnpm install
```

### 2. Environment Configuration
Copy `.env.local.example` to `.env.local` and configure:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/timesink"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key"

# Email (for magic link auth)
EMAIL_SERVER="smtp://username:password@smtp.example.com:587"
EMAIL_FROM="noreply@example.com"

# Redis
REDIS_URL="redis://localhost:6379"
REDIS_TOKEN=""

# S3/R2 Storage
S3_ENDPOINT="https://your-account.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_BUCKET="timesink-data"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"

# Security
MAZE_TOKEN_SECRET="your-maze-token-secret"
CRON_SECRET="your-cron-secret"

# Optional
ASN_DB_PATH="/path/to/asn.db"
```

### 3. Database Setup
```bash
pnpm prisma generate
pnpm prisma db push
# Or for production:
pnpm prisma migrate deploy
```

### 4. Development
```bash
pnpm dev
```

Visit `http://localhost:3000` to access the application.

## Deployment

### Recommended Stack
- **App Hosting**: Vercel
- **Database**: Neon or Supabase Postgres
- **Cache**: Upstash Redis
- **Storage**: Cloudflare R2
- **Email**: Resend or SendGrid

### Vercel Deployment

1. **Connect Repository**: Import to Vercel dashboard

2. **Environment Variables**: Add all `.env.local` variables to Vercel

3. **Build Settings**: 
   ```
   Build Command: pnpm build
   Output Directory: .next
   Install Command: pnpm install
   ```

4. **Cron Job Setup**: Add to `vercel.json`:
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/cleanup",
         "schedule": "0 2 * * *"
       }
     ]
   }
   ```

### Database Migration
For production deployments:
```bash
pnpm prisma migrate deploy
```

### S3/R2 Lifecycle Policy
Configure automatic object deletion as backup:
```json
{
  "Rules": [
    {
      "ID": "DeleteAfter7Days",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "sessions/"
      },
      "Expiration": {
        "Days": 7
      }
    }
  ]
}
```

## Usage

### Creating Mazes

1. **Sign In**: Use email magic link authentication
2. **Templates**: Start with pre-built templates or create from scratch
3. **Builder**: Drag trials, configure difficulty, set up loopbacks
4. **Publish**: Generate honey URL slug
5. **Share**: Distribute honey URLs to waste scammer time

### Templates Available

- **Invoice Verification**: Classic payment flow (15-25 min)
- **Account Unlock**: Security verification (20-35 min)  
- **Prize Claim**: High-frustration prize process (25-45 min)

### Honey URLs

Share links like: `https://yoursite.com/honey/payment-verify-2024`

Scammers get redirected to: `https://yoursite.com/play/[sessionId]`

### Analytics Dashboard

- Total time wasted across all mazes
- Session completion rates  
- Automation detection statistics
- 30-day activity sparklines
- Export capabilities for session data

## API Endpoints

### Maze Runtime
- `POST /api/maze-runtime/next` - Get next trial
- `POST /api/maze-runtime/verify` - Validate trial answer

### Telemetry  
- `POST /api/telemetry/heartbeat` - Active time tracking
- `POST /api/telemetry/rrweb` - Session recording events
- `POST /api/telemetry/flag` - Automation detection

### Management
- `GET/POST/PUT /api/mazes` - Maze CRUD operations
- `GET /api/analytics/summary` - Usage statistics
- `GET /api/export/session/:id` - Download session data

### Automation
- `GET /api/cron/cleanup` - Scheduled data cleanup

## Architecture

### Progress Illusion
- Display: `(actualStepsCompleted % 10) || 10`
- Reality: 20+ steps required before restart message
- Restart: ">(1 of 20) answers incorrect, please try again"

### Data Retention
- **Sessions**: Auto-expire after 7 days
- **Events**: Linked to session expiration
- **Artifacts**: S3 objects with lifecycle policy
- **Cleanup**: Daily cron job + lifecycle backup

### Privacy Design
- IP addresses bucketed (192.168.1.0/24)
- User agents hashed (SHA-256, truncated)
- No cross-session correlation
- No third-party trackers
- Clear abuse deterrence notice

## Security

### Token System
- HMAC-signed step tokens with expiration
- Session/trial/step validation
- Automatic token rotation

### Rate Limiting
- Redis-based request throttling
- Session creation limits
- API endpoint protection

### Data Protection
- No legitimate user PII collected
- Scammer telemetry only (privacy-preserving)
- Automatic data expiration
- S3 bucket security policies

## Ethics & Legal

### Intended Use
- Scammer time-wasting only
- Security research and education
- Abuse deterrence demonstration

### Restrictions
- No brand impersonation
- No legitimate service disruption
- Clear research disclosure required
- Respect data protection laws

### Footer Required
All honey pages include: "Abuse-deterrence research; no personal services provided."

## Contributing

### Development Setup
1. Follow setup instructions above
2. Create feature branch
3. Implement with tests
4. Submit pull request

### Trial Development
Add new trial types in `components/trials/`:
1. Create component with required interface
2. Add to `TrialRenderer.tsx`
3. Update validation in `lib/validate.ts`
4. Add to templates if desired

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Prisma for database
- Tailwind for styling

## License

MIT License - See LICENSE file for details.

## Support

For issues, questions, or contributions:
- GitHub Issues
- Security issues: security@example.com
- General questions: hello@example.com

---

**Warning**: This software is designed for scammer deterrence only. Use responsibly and in compliance with applicable laws.