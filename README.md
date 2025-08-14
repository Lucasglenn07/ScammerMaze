# TimeSink - Scammer Time Wasting Platform

TimeSink is a comprehensive platform for creating and managing websites designed to waste scammers' time through carefully crafted task mazes. The platform allows users to build custom verification workflows that appear legitimate but are designed to be time-consuming and frustrating.

## 🎯 Features

### Core Platform
- **User Authentication**: Email/password signup with email verification
- **Dashboard**: Overview of total time wasted, active mazes, and session statistics
- **Drag & Drop Builder**: Zapier-like interface for creating custom task mazes
- **Template System**: Pre-built maze templates including a basic 5-task loop
- **Analytics & Reporting**: Comprehensive analytics with session tracking and performance metrics

### Scammer-Facing Sites
- **Professional Financial Portal UI**: Legitimate-looking verification interface
- **Multiple Task Types**: Image hunts, form filling, calculations, wait timers, CAPTCHAs
- **Smart Looping**: Mazes can loop infinitely or redirect to previous steps
- **Session Tracking**: Full analytics on time spent, completion rates, and user behavior

## 🏗️ Architecture

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **ReactFlow** for the drag-and-drop maze builder
- **Lucide Icons** for consistent iconography

### Backend
- **Next.js API Routes** for server-side logic
- **Prisma ORM** with PostgreSQL database
- **JWT Authentication** with secure HTTP-only cookies
- **bcryptjs** for password hashing

### Database Schema
- **Users**: Authentication and account management
- **Mazes**: Task flow definitions and configurations
- **Sessions**: Individual scammer interactions
- **Events**: Detailed tracking of each task attempt
- **Analytics**: Aggregated statistics and reporting data

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- SMTP server for email verification (optional)

### Installation

1. **Clone and install dependencies**:
```bash
cd timesink
npm install
```

2. **Set up environment variables**:
Create a `.env.local` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/timesink"
JWT_SECRET="your-jwt-secret-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Email configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

3. **Set up the database**:
```bash
npx prisma generate
npx prisma db push
```

4. **Start the development server**:
```bash
npm run dev
```

5. **Access the application**:
- Main platform: `http://localhost:3000`
- Registration: `http://localhost:3000/auth/register`
- Login: `http://localhost:3000/auth/login`

## 📝 Usage Guide

### 1. Account Setup
1. Visit `/auth/register` to create an account
2. Verify your email address (check console logs in development)
3. Login at `/auth/login`

### 2. Creating Your First Maze
1. Go to "Create New Maze" from the dashboard
2. Use the drag-and-drop builder to add tasks:
   - **Image Hunt**: Users find objects in images
   - **Form Filling**: Collect personal information
   - **Math Problems**: Security verification calculations
   - **Wait Timers**: Forced waiting periods
   - **CAPTCHAs**: Human verification

3. Connect tasks with arrows to create the flow
4. Configure each task's difficulty and parameters
5. Save and publish your maze

### 3. Using Templates
1. Visit `/templates` to see pre-built mazes
2. The "Basic Loop" template includes:
   - Image object finding
   - Personal information form
   - 5 math problems
   - 30-second wait timer
   - CAPTCHA verification
   - Loops back to the beginning

3. Click "Use Template" to create a copy you can customize

### 4. Sharing Scammer Sites
1. Once published, your maze gets a unique URL: `/portal/[slug]`
2. Share this URL with scammers
3. The site appears as "SecureBank Verification Portal"
4. Scammers will be guided through your task maze

### 5. Analytics & Reporting
1. Visit `/analytics` to see detailed reports:
   - Total time wasted across all mazes
   - Session duration and completion rates
   - Geographic distribution of visitors
   - Device type breakdown
   - Trial-by-trial performance metrics
   - Exit rates and abandonment points

2. Export data as CSV for further analysis
3. Filter by date range and specific mazes

## 🔧 Task Types

### Image Hunt
- Present images to users
- Ask them to find specific objects
- Configurable time limits
- Frustrating when objects are hard to find

### Form Filling
- Collect detailed personal information
- Multiple required fields
- Validation rules
- Can be made increasingly complex

### Math Problems
- Security verification calculations
- Configurable difficulty levels
- Multiple problems in sequence
- Can include complex arithmetic

### Wait Timers
- Forced waiting periods
- "Processing" or "Verification" messages
- No skip options
- Waste pure time

### CAPTCHA
- Human verification challenges
- Random success/failure rates
- Multiple attempts required
- Classic time-wasting technique

## 📊 Analytics Features

### Overview Metrics
- Total sessions across all mazes
- Cumulative time wasted
- Average session duration
- Completion rates
- Unique visitor tracking

### Detailed Reports
- Session-by-session breakdown
- Geographic visitor distribution
- Device and browser analytics
- Hourly activity patterns
- Trial performance metrics

### Export Capabilities
- CSV data export
- Custom date ranges
- Per-maze filtering
- Raw session data

## 🔒 Security & Privacy

### Data Protection
- 7-day automatic data retention
- IP addresses are masked (last octet removed)
- No personally identifiable information stored
- User agent strings are hashed

### Privacy by Design
- Minimal data collection
- Automatic data expiration
- Bucketed IP addresses
- No cross-site tracking

## 🎨 Customization

### Maze Builder
- Drag-and-drop interface
- Task difficulty settings
- Conditional branching
- Loop configurations
- Custom messaging

### Portal Appearance
- Professional financial institution look
- SSL security indicators
- Progress bars and step tracking
- Legitimate verification language

## 📈 Best Practices

### Effective Maze Design
1. **Start Simple**: Begin with easy tasks to build confidence
2. **Increase Complexity**: Gradually make tasks more difficult
3. **Add Delays**: Use wait timers strategically
4. **Create Loops**: Send users back to previous steps
5. **False Progress**: Show progress bars that reset

### Maximizing Time Waste
1. **Multiple Verification Steps**: Require several forms of verification
2. **Precise Requirements**: Make form fields very specific
3. **Random Failures**: Have CAPTCHAs fail occasionally
4. **Processing Delays**: Add artificial wait times
5. **Endless Loops**: Never actually complete the process

## 🛠️ Development

### Project Structure
```
timesink/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── builder/           # Maze builder interface
│   ├── portal/            # Scammer-facing sites
│   ├── templates/         # Template gallery
│   └── analytics/         # Reporting dashboard
├── prisma/                # Database schema
├── components/            # Reusable components
└── lib/                   # Utility functions
```

### Key Components
- **MazeBuilder**: ReactFlow-based drag-and-drop interface
- **ScammerPortal**: Professional-looking verification site
- **Analytics**: Comprehensive reporting dashboard
- **Templates**: Pre-built maze configurations

## 📋 TODO / Future Enhancements

- [ ] Real-time session monitoring
- [ ] A/B testing for maze effectiveness
- [ ] Advanced CAPTCHA generation
- [ ] Email notification system
- [ ] Webhook integrations
- [ ] Mobile app version
- [ ] Team collaboration features
- [ ] Advanced analytics with ML insights

## ⚖️ Legal & Ethical Considerations

**Important**: TimeSink is designed for defensive purposes against scammers who are actively attempting fraud. Users should:

- Only use this platform against confirmed scammers
- Comply with local laws and regulations
- Not collect sensitive personal information
- Use responsibly and ethically
- Consider the platform as a research tool for anti-fraud efforts

## 📞 Support

For questions, issues, or contributions, please:
1. Check the documentation above
2. Review the codebase structure
3. Create detailed issue reports
4. Follow ethical usage guidelines

---

**Remember**: The goal is to waste scammers' time, not to harm innocent users. Use this platform responsibly and in compliance with applicable laws.