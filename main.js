/**
 * ScammerMaze - Main Application Entry Point
 * Initialize the game when the page loads
 */

let game = null;

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 ScammerMaze - The Ultimate Time Sink is loading...');
    
    try {
        // Initialize the game
        game = new ScammerMazeGame('mazeCanvas');
        
        console.log('✅ ScammerMaze initialized successfully!');
        console.log('🎯 Ready to waste some scammers\' time!');
        
        // Add some easter eggs and taunting messages
        const taunts = [
            'Welcome to your worst nightmare, scammer!',
            'Hope you have all day... you\'ll need it! 😈',
            'Every second you spend here is a victory for honest people!',
            'Getting frustrated yet? Good! 🤣',
            'This maze was designed just for you!'
        ];
        
        // Show random taunt after a delay
        setTimeout(() => {
            const randomTaunt = taunts[Math.floor(Math.random() * taunts.length)];
            console.log(`💬 ${randomTaunt}`);
        }, 2000);
        
        // Add analytics tracking for time wasted
        setInterval(() => {
            if (game && game.gameState.isPlaying) {
                const timeWasted = game.gameState.timeElapsed;
                if (timeWasted > 0 && timeWasted % 30000 === 0) { // Every 30 seconds
                    console.log(`⏰ Time successfully wasted: ${Math.floor(timeWasted / 1000)} seconds`);
                }
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Failed to initialize ScammerMaze:', error);
        
        // Fallback error display
        const canvas = document.getElementById('mazeCanvas');
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ff0000';
        ctx.font = '20px Arial';
        ctx.fillText('Error: Failed to load game', 50, 50);
        ctx.fillText('Please refresh the page', 50, 80);
    }
});

// Prevent right-click context menu to add to frustration
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    if (game) {
        game.gameState.addTrapMessage('🚫 Nice try! No cheating allowed!');
    }
});

// Prevent common keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Prevent F12, Ctrl+Shift+I, Ctrl+U, etc.
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C')) {
        e.preventDefault();
        if (game) {
            game.gameState.addTrapMessage('🔒 Developer tools disabled! Focus on the maze!');
        }
        return false;
    }
});

// Add window focus/blur detection for additional frustration
let blurCount = 0;
window.addEventListener('blur', function() {
    blurCount++;
    if (game && blurCount > 3) {
        // Reset player position if they keep trying to cheat by looking elsewhere
        game.player.x = 1;
        game.player.y = 1;
        game.gameState.addTrapMessage('🔄 Stop getting distracted! Back to start!');
    }
});

// Taunting messages for console
const consoleTaunts = [
    '👀 Looking for cheats? There are none!',
    '🤔 Trying to inspect the code? The maze changes anyway!',
    '😏 Source code won\'t help you navigate this maze!',
    '⏱️ Every second you spend here makes us happy!',
    '🎯 You\'re trapped now! Might as well play the game!'
];

// Show console taunts periodically
setInterval(() => {
    if (Math.random() < 0.1) { // 10% chance every interval
        const taunt = consoleTaunts[Math.floor(Math.random() * consoleTaunts.length)];
        console.log(`%c${taunt}`, 'color: #00ff00; font-weight: bold; font-size: 14px;');
    }
}, 5000);

// Global functions for debugging (but they don't actually help)
window.cheat = function() {
    console.log('%c🚫 CHEATING DETECTED! 🚫', 'color: red; font-size: 20px; font-weight: bold;');
    console.log('Nice try, but this maze is cheat-proof!');
    if (game) {
        game.player.x = 1;
        game.player.y = 1;
        game.gameState.addTrapMessage('🚨 Cheating attempt detected! Teleported to start!');
    }
};

window.solution = function() {
    console.log('%c🗺️ LOOKING FOR SOLUTIONS? 🗺️', 'color: yellow; font-size: 16px;');
    console.log('The only solution is to play the game fairly!');
    if (game) {
        game.gameState.addTrapMessage('🧩 There are no shortcuts! Play the maze!');
    }
};

window.exit = function() {
    console.log('%c🚪 TRYING TO EXIT? 🚪', 'color: blue; font-size: 16px;');
    console.log('The only exit is through the maze!');
    if (game) {
        game.gameState.addTrapMessage('🔐 Nice try! The only way out is to complete the maze!');
    }
};
