# TimeSink - Scammer Deterrence Research Platform

TimeSink is a research platform for creating and deploying verification mazes designed to waste scammers' time. Build custom workflows with deliberately frustrating elements and track the time wasted.

## Features

### 🎯 Maze Builder (Zapier-like Interface)
- **Drag-and-Drop Interface**: Create custom mazes by dragging trial components from the library
- **Trial Library**: 5+ different trial types with configurable difficulty levels
- **Real-time Configuration**: Adjust trial settings and difficulty in real-time
- **Loop Controls**: Enable looping with configurable loop chances
- **Visual Flow**: See your maze flow with connected trial blocks
- **Save & Preview**: Save your custom mazes and preview them before deployment

### 🏦 Financial Portal Styling
All scammer sites now have the look and feel of legitimate secure financial portals:
- **Professional Design**: Clean, modern interface with banking-grade aesthetics
- **Security Indicators**: SSL badges, security icons, and trust signals
- **Progress Indicators**: Professional loading bars and verification steps
- **Error Handling**: Legitimate-looking error messages and security alerts
- **Responsive Design**: Works seamlessly across all devices

### 📊 Trial Types Available
1. **Image Hunt** - Select images matching criteria
2. **Drag Sum** - Drag items to match target sum
3. **Loading Abyss** - Extended loading with progress
4. **Multi-Layer CAPTCHA** - Multiple verification steps
5. **Slow Reveal** - Gradually reveal verification content

### 🔄 Basic Looping Maze Template
A pre-built template with 5 different tasks that loops continuously:
- Image verification
- Transaction verification
- Processing verification
- Multi-factor authentication
- Security code verification

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
cd timesink
npm install
```

### Development
```bash
npm run dev
```

### Database Setup
```bash
npm run db:generate
npm run db:push
```

## Usage

### Creating Custom Mazes
1. Navigate to the **Maze Builder** from the homepage
2. Drag trial components from the library to the canvas
3. Configure each trial's settings in the right panel
4. Adjust difficulty levels using the numbered buttons
5. Enable looping if desired
6. Save your maze for deployment

### Trial Configuration
Each trial type has specific configuration options:
- **Image Hunt**: Grid size, instructions, minimum time
- **Drag Sum**: Target sum, number of items, available numbers
- **Loading Abyss**: Duration, messages, reset on blur
- **Multi-Layer CAPTCHA**: Step types, difficulty, restart on fail
- **Slow Reveal**: Reveal time, expected answer, progress steps

### Difficulty Levels
All trials support 5 difficulty levels (1-5):
- Level 1: Easy, quick completion
- Level 2: Moderate challenge
- Level 3: Standard difficulty
- Level 4: High challenge
- Level 5: Maximum frustration

## Research Use Only

This platform is designed for scammer deterrence research. Use responsibly and in compliance with applicable laws.

## Security Features

- **Privacy by Design**: 7-day retention, no PII collection
- **Session Recording**: Full rrweb session replay for analysis
- **IP Bucketing**: Anonymous IP tracking
- **Secure Storage**: Encrypted data storage

## Contributing

This is a research platform. Please ensure all contributions align with ethical research practices and applicable laws.

## License

Research use only. No commercial applications permitted.