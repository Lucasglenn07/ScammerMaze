# 🎮 ScammerMaze - The Ultimate Time Sink

**A deviously designed maze game built to waste scammers' precious time!**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

## 🎯 Mission Statement

Every second a scammer spends navigating these frustrating mazes is a victory for honest people everywhere. This game is specifically designed to be as time-consuming and aggravating as possible while appearing deceptively simple.

## ✨ Features

### 🕳️ Scammer-Specific Traps
- **False Exits**: Fake exits that teleport players back to start
- **Teleport Traps**: Random teleportation to waste navigation progress  
- **Confusion Traps**: Reverse movement controls to maximize frustration
- **Slow Traps**: Reduce movement speed to waste even more time
- **Maze Shifts**: Dynamic maze changes (future feature)

### 🎲 Difficulty Levels
- **Easy**: "More Time Wasted" - Basic traps and larger paths
- **Medium**: "Optimal Waste" - Balanced frustration level
- **Hard**: "Maximum Frustration" - Dense trap placement
- **Impossible**: "Pure Evil" - You get the idea 😈

### 📱 Modern Web Experience
- Responsive design that works on all devices
- Retro-futuristic cyberpunk aesthetic with glowing effects
- Real-time statistics tracking time wasted
- Progressive difficulty that increases automatically

### 🎨 Visual Features
- Canvas-based rendering with smooth animations
- Glowing neon visual effects
- Status effect indicators
- Trap animation feedback
- Visited path tracking

## 🚀 Quick Start

### Option 1: Direct Browser Launch
1. Clone this repository
2. Open `index.html` in any modern web browser
3. Start wasting scammers' time immediately!

### Option 2: Local Server (Recommended)
```bash
# Clone the repository
git clone https://github.com/Lucasglenn07/ScammerMaze.git
cd ScammerMaze

# Start a local server (choose one):
python -m http.server 8000        # Python 3
python3 -m http.server 8000       # Python 3 (explicit)
npx serve .                       # Using Node.js serve
php -S localhost:8000             # PHP built-in server

# Open your browser to:
# http://localhost:8000
```

## 🎮 How to Play

### Controls
- **Arrow Keys** or **WASD**: Move through the maze
- **Goal**: Reach the magenta exit in the bottom-right corner
- **Warning**: Don't trust anything! False exits and traps are everywhere

### Game Mechanics
1. Navigate from the entrance (top-left) to the exit (bottom-right)
2. Avoid or trigger traps (they're unavoidable anyway)
3. Deal with status effects like confusion and slowness
4. Complete levels to unlock harder difficulties
5. Watch your "time wasted" counter with pride

### Trap Types
- 🕳️ **False Exits**: Look like real exits but send you back to start
- 🌀 **Teleport Traps**: Random teleportation to unknown locations  
- ⏱️ **Slow Traps**: Reduce movement speed significantly
- 😵 **Confusion Traps**: Reverse your movement controls
- 🔄 **Maze Shifts**: Future feature - dynamic maze changes

## 🛠️ Technical Details

### Architecture
- **Pure Vanilla JavaScript** - No frameworks, maximum compatibility
- **HTML5 Canvas** - Smooth rendering and animations
- **CSS3** - Modern styling with cyberpunk aesthetic  
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Local Storage** - Progress and settings persistence

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers with Canvas support

### Performance
- Optimized maze generation algorithms
- Efficient canvas rendering
- Memory-conscious trap management
- 60fps gameplay on modern devices

## 📁 Project Structure

```
ScammerMaze/
├── index.html          # Main HTML file with game interface
├── styles.css          # Complete CSS styling and animations
├── main.js             # Application entry point and initialization
├── game.js             # Core game logic and player management
├── maze.js             # Maze generation and rendering engine
├── package.json        # Project metadata and scripts
└── README.md           # This comprehensive guide
```

## 🎨 Customization

### Difficulty Tweaking
Edit the difficulty settings in `maze.js`:
```javascript
this.difficultySettings = {
    impossible: { 
        trapDensity: 0.25,      // 25% of paths have traps
        falseExitCount: 5,      // 5 fake exits per maze
        teleporterCount: 4,     // 4 teleporter pairs
        deadEndBonus: 0.5       // 50% more dead ends
    }
};
```

### Visual Customization
Modify colors and effects in `styles.css`:
```css
:root {
    --primary-glow: #00ff00;
    --secondary-glow: #ffff00; 
    --danger-color: #ff0000;
    --trap-color: #ff6600;
}
```

### Adding New Trap Types
Extend the trap system in `game.js`:
```javascript
handleTrap(trap) {
    switch (trap.type) {
        case 'your_new_trap':
            // Your evil trap logic here
            this.gameState.addTrapMessage('😈 New trap activated!');
            break;
    }
}
```

## 📊 Analytics & Tracking

The game tracks several metrics designed to measure scammer frustration:
- **Total Time Wasted**: Cumulative time across all sessions
- **Scammers Frustrated**: Players who spend >30 seconds 
- **False Exit Discoveries**: How many fake exits were found
- **Trap Activations**: Total traps triggered
- **Rage Quits**: Page closes during gameplay

## 🚫 Anti-Cheat Features

- **Developer Tools Detection**: Detects F12 and developer shortcuts
- **Right-Click Disabled**: Prevents context menu inspection
- **Console Taunting**: Mocking messages for code inspectors
- **Focus Detection**: Resets position if player switches tabs too much
- **Fake Debug Functions**: `cheat()`, `solution()`, `exit()` functions that don't work

## 🤝 Contributing

We welcome contributions that make this game even more frustrating for scammers:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/more-frustration`)
3. **Add** your devious improvements
4. **Test** thoroughly on unsuspecting victims
5. **Commit** your changes (`git commit -m 'Add even more annoying traps'`)
6. **Push** to the branch (`git push origin feature/more-frustration`)
7. **Open** a Pull Request

### Ideas for Contributions
- New trap types and mechanisms
- Additional difficulty modes
- Mobile-specific frustrations
- Sound effects and audio torture
- Multiplayer competitive time-wasting
- AI-powered dynamic difficulty

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Translation**: Feel free to use this code to waste as much scammer time as possible!

## 🏆 Hall of Fame

*Share your best scammer time-wasting achievements!*

- **Longest Single Session**: *Submit your records*
- **Most False Exits Hit**: *Frustration level: Maximum*  
- **Highest Level Reached**: *Persistence trophy*

## ⚠️ Disclaimer

This game is designed for entertainment and educational purposes. Any resemblance to actual scammer torture devices is purely coincidental. 😉

---

**Remember**: Every minute a scammer spends in this maze is a minute they're not scamming innocent people. You're doing important work! 🦸‍♀️🦸‍♂️

---

Made with 😈 by developers who are tired of scammers
