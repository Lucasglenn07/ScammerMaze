/**
 * ScammerMaze - Game Logic and Player Management
 * Main game engine designed to maximize time-wasting potential
 */

class Player {
    constructor(x = 1, y = 1) {
        this.x = x;
        this.y = y;
        this.lastX = x;
        this.lastY = y;
        this.moveSpeed = 1;
        this.isSlowed = false;
        this.isConfused = false;
        this.slowDuration = 0;
        this.confusionDuration = 0;
    }
    
    move(dx, dy, maze) {
        this.lastX = this.x;
        this.lastY = this.y;
        
        // Apply confusion effect (reverse controls)
        if (this.isConfused) {
            dx = -dx;
            dy = -dy;
        }
        
        const newX = this.x + dx;
        const newY = this.y + dy;
        
        // Check boundaries and walls
        if (this.canMoveTo(newX, newY, maze)) {
            this.x = newX;
            this.y = newY;
            return true;
        }
        
        return false;
    }
    
    canMoveTo(x, y, maze) {
        const mazeData = maze.maze;
        
        // Check boundaries
        if (x < 0 || x >= mazeData[0].length || y < 0 || y >= mazeData.length) {
            return false;
        }
        
        // Check for walls
        return mazeData[y][x] === 0;
    }
    
    update() {
        // Update status effects
        if (this.slowDuration > 0) {
            this.slowDuration--;
            if (this.slowDuration <= 0) {
                this.isSlowed = false;
                this.moveSpeed = 1;
            }
        }
        
        if (this.confusionDuration > 0) {
            this.confusionDuration--;
            if (this.confusionDuration <= 0) {
                this.isConfused = false;
            }
        }
    }
    
    applySlow(duration = 300) { // 5 seconds at 60fps
        this.isSlowed = true;
        this.slowDuration = duration;
        this.moveSpeed = 0.5;
    }
    
    applyConfusion(duration = 180) { // 3 seconds at 60fps
        this.isConfused = true;
        this.confusionDuration = duration;
    }
    
    reset(x = 1, y = 1) {
        this.x = x;
        this.y = y;
        this.lastX = x;
        this.lastY = y;
        this.isSlowed = false;
        this.isConfused = false;
        this.slowDuration = 0;
        this.confusionDuration = 0;
        this.moveSpeed = 1;
    }
}

class GameState {
    constructor() {
        this.level = 1;
        this.score = 0;
        this.timeStarted = null;
        this.timeElapsed = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.visitedCells = new Set();
        this.trapMessages = [];
        this.globalStats = {
            totalTimeWasted: 0,
            scammersFrustrated: 0
        };
    }
    
    startGame() {
        this.isPlaying = true;
        this.isPaused = false;
        this.isGameOver = false;
        this.timeStarted = Date.now();
    }
    
    pauseGame() {
        this.isPaused = true;
    }
    
    resumeGame() {
        this.isPaused = false;
        this.timeStarted = Date.now() - this.timeElapsed;
    }
    
    endGame(completed = false) {
        this.isPlaying = false;
        this.isGameOver = true;
        
        if (completed) {
            this.score += Math.max(1000 - this.timeElapsed / 1000, 100);
            this.level++;
        }
        
        // Update global stats
        this.globalStats.totalTimeWasted += this.timeElapsed;
        if (this.timeElapsed > 30000) { // If spent more than 30 seconds
            this.globalStats.scammersFrustrated++;
        }
    }
    
    update() {
        if (this.isPlaying && !this.isPaused) {
            this.timeElapsed = Date.now() - this.timeStarted;
        }
    }
    
    addVisitedCell(x, y) {
        this.visitedCells.add(`${x},${y}`);
    }
    
    addTrapMessage(message) {
        this.trapMessages.push({
            message,
            timestamp: Date.now(),
            duration: 3000
        });
    }
    
    updateTrapMessages() {
        const now = Date.now();
        this.trapMessages = this.trapMessages.filter(
            msg => now - msg.timestamp < msg.duration
        );
    }
    
    reset() {
        this.score = 0;
        this.timeElapsed = 0;
        this.timeStarted = null;
        this.isPlaying = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.visitedCells.clear();
        this.trapMessages = [];
    }
    
    resetLevel() {
        this.timeElapsed = 0;
        this.timeStarted = null;
        this.isPlaying = false;
        this.isPaused = false;
        this.isGameOver = false;
        this.visitedCells.clear();
        this.trapMessages = [];
    }
}

class ScammerMazeGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.gameState = new GameState();
        this.player = new Player();
        this.maze = null;
        this.renderer = null;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        
        // Game settings
        this.difficulty = 'medium';
        this.mazeSize = 'medium';
        this.cellSize = 16;
        
        // Input handling
        this.keys = {};
        this.lastMoveTime = 0;
        this.moveDelay = 150; // Milliseconds between moves
        
        // Initialize
        this.initializeEventListeners();
        this.setupGame();
    }
    
    initializeEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Button controls
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('nextLevelButton').addEventListener('click', () => {
            this.nextLevel();
        });
        
        document.getElementById('restartButton').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('newGameButton').addEventListener('click', () => {
            this.newGame();
        });
        
        // Settings controls
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
        });
        
        document.getElementById('mazeSize').addEventListener('change', (e) => {
            this.mazeSize = e.target.value;
        });
    }
    
    setupGame() {
        const sizes = {
            small: { width: 15, height: 15, cellSize: 24 },
            medium: { width: 25, height: 25, cellSize: 20 },
            large: { width: 35, height: 35, cellSize: 16 },
            massive: { width: 51, height: 51, cellSize: 12 }
        };
        
        const config = sizes[this.mazeSize];
        this.cellSize = config.cellSize;
        
        // Generate new maze
        this.maze = new MazeGenerator(config.width, config.height, this.difficulty);
        this.renderer = new MazeRenderer(this.canvas, this.cellSize);
        
        // Reset player position
        this.player.reset(1, 1);
        this.gameState.resetLevel();
        
        // Update display
        this.updateDisplay();
        this.render();
    }
    
    startGame() {
        this.gameState.startGame();
        this.hideOverlay();
        this.gameLoop();
    }
    
    nextLevel() {
        this.gameState.level++;
        this.setupGame();
        this.startGame();
    }
    
    restartGame() {
        this.setupGame();
        this.startGame();
    }
    
    newGame() {
        this.gameState.reset();
        this.gameState.level = 1;
        this.setupGame();
        this.showOverlay('Get Ready!', 'Navigate through the maze to reach the exit...', ['start']);
    }
    
    gameLoop() {
        if (!this.gameState.isPlaying) return;
        
        const currentTime = Date.now();
        
        // Handle input
        this.handleInput(currentTime);
        
        // Update game state
        this.update();
        
        // Render
        this.render();
        
        // Update display
        this.updateDisplay();
        
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }
    
    handleInput(currentTime) {
        if (currentTime - this.lastMoveTime < this.moveDelay) return;
        if (this.player.isSlowed && currentTime - this.lastMoveTime < this.moveDelay * 2) return;
        
        let moved = false;
        
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
            moved = this.player.move(0, -1, this.maze);
        } else if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
            moved = this.player.move(0, 1, this.maze);
        } else if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            moved = this.player.move(-1, 0, this.maze);
        } else if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            moved = this.player.move(1, 0, this.maze);
        }
        
        if (moved) {
            this.lastMoveTime = currentTime;
            this.onPlayerMoved();
        }
    }
    
    onPlayerMoved() {
        const x = this.player.x;
        const y = this.player.y;
        
        // Add to visited cells
        this.gameState.addVisitedCell(x, y);
        
        // Check for traps
        const trap = this.maze.hasTrap(x, y);
        if (trap) {
            this.handleTrap(trap);
        }
        
        // Check for teleporters
        const teleporter = this.maze.hasTeleporter(x, y);
        if (teleporter) {
            this.handleTeleporter(x, y);
        }
        
        // Check for false exits
        const falseExit = this.maze.isFalseExit(x, y);
        if (falseExit) {
            this.handleFalseExit(falseExit);
        }
        
        // Check for real exit
        if (x === this.maze.width - 1 && y === this.maze.height - 2) {
            this.handleLevelComplete();
        }
    }
    
    handleTrap(trap) {
        this.maze.triggerTrap(trap.x, trap.y);
        
        switch (trap.type) {
            case 'slow':
                this.player.applySlow();
                this.gameState.addTrapMessage('⏱️ You feel sluggish... movement is slower!');
                break;
                
            case 'teleport':
                // Random teleport
                const pathCells = this.maze.getPathCells();
                if (pathCells.length > 0) {
                    const randomCell = pathCells[Math.floor(Math.random() * pathCells.length)];
                    this.player.x = randomCell[0];
                    this.player.y = randomCell[1];
                    this.gameState.addTrapMessage('🌀 Whoosh! You were teleported somewhere random!');
                }
                break;
                
            case 'confusion':
                this.player.applyConfusion();
                this.gameState.addTrapMessage('😵 Your controls are reversed! Think backwards!');
                break;
                
            case 'fake_exit':
                this.gameState.addTrapMessage('🕳️ This was a fake exit! Try another path!');
                break;
        }
        
        // Visual effect
        this.renderer.animateTrap(trap.x, trap.y, trap.type);
    }
    
    handleTeleporter(x, y) {
        const destination = this.maze.useTeleporter(x, y);
        if (destination) {
            this.player.x = destination.x;
            this.player.y = destination.y;
            this.gameState.addTrapMessage('⚡ Teleported! Where are you now?');
        }
    }
    
    handleFalseExit(falseExit) {
        falseExit.discovered = true;
        this.gameState.addTrapMessage('❌ False exit discovered! This leads nowhere!');
        
        // Teleport player back to start as punishment
        setTimeout(() => {
            this.player.x = 1;
            this.player.y = 1;
            this.gameState.addTrapMessage('🔄 Sent back to start! Think you can fool me?');
        }, 1000);
    }
    
    handleLevelComplete() {
        this.gameState.endGame(true);
        
        const messages = [
            'Congratulations! You escaped this maze!',
            'But wait... there are MORE mazes!',
            'Ready for the next challenge?'
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        this.showOverlay('Level Complete!', message, ['nextLevel']);
        
        // Increase difficulty slightly for next level
        if (this.gameState.level % 3 === 0) {
            this.increaseDifficulty();
        }
    }
    
    increaseDifficulty() {
        const difficulties = ['easy', 'medium', 'hard', 'impossible'];
        const currentIndex = difficulties.indexOf(this.difficulty);
        
        if (currentIndex < difficulties.length - 1) {
            this.difficulty = difficulties[currentIndex + 1];
            document.getElementById('difficulty').value = this.difficulty;
            this.gameState.addTrapMessage(`🔥 Difficulty increased to ${this.difficulty.toUpperCase()}!`);
        }
    }
    
    update() {
        this.gameState.update();
        this.player.update();
        this.gameState.updateTrapMessages();
    }
    
    render() {
        this.renderer.render(this.maze, this.player, this.gameState.visitedCells);
        this.renderTrapMessages();
        this.renderStatusEffects();
    }
    
    renderTrapMessages() {
        const ctx = this.renderer.ctx;
        const messages = this.gameState.trapMessages;
        
        messages.forEach((msg, index) => {
            const y = 30 + (index * 25);
            const opacity = Math.max(0, 1 - (Date.now() - msg.timestamp) / msg.duration);
            
            ctx.fillStyle = `rgba(255, 255, 0, ${opacity})`;
            ctx.font = '14px Orbitron';
            ctx.fillText(msg.message, 10, y);
        });
    }
    
    renderStatusEffects() {
        const ctx = this.renderer.ctx;
        const effects = [];
        
        if (this.player.isSlowed) {
            effects.push('🐌 SLOWED');
        }
        
        if (this.player.isConfused) {
            effects.push('😵 CONFUSED');
        }
        
        effects.forEach((effect, index) => {
            const x = this.canvas.width - 120;
            const y = 30 + (index * 25);
            
            ctx.fillStyle = '#ff6600';
            ctx.font = 'bold 12px Orbitron';
            ctx.fillText(effect, x, y);
        });
    }
    
    updateDisplay() {
        // Update time
        const minutes = Math.floor(this.gameState.timeElapsed / 60000);
        const seconds = Math.floor((this.gameState.timeElapsed % 60000) / 1000);
        document.getElementById('timeWasted').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update level
        document.getElementById('currentLevel').textContent = this.gameState.level;
        
        // Update score
        document.getElementById('score').textContent = Math.floor(this.gameState.score);
        
        // Update global stats
        const globalMinutes = Math.floor(this.gameState.globalStats.totalTimeWasted / 60000);
        document.getElementById('globalTimeWasted').textContent = 
            globalMinutes > 999 ? '∞' : `${globalMinutes}m`;
        
        document.getElementById('scammersFrustrated').textContent = 
            this.gameState.globalStats.scammersFrustrated > 9999 ? '9,999+' : this.gameState.globalStats.scammersFrustrated;
    }
    
    showOverlay(title, message, buttons = []) {
        document.getElementById('overlayTitle').textContent = title;
        document.getElementById('overlayMessage').textContent = message;
        
        // Hide all buttons
        document.getElementById('startButton').classList.add('hidden');
        document.getElementById('nextLevelButton').classList.add('hidden');
        document.getElementById('restartButton').classList.add('hidden');
        
        // Show requested buttons
        buttons.forEach(button => {
            switch (button) {
                case 'start':
                    document.getElementById('startButton').classList.remove('hidden');
                    break;
                case 'nextLevel':
                    document.getElementById('nextLevelButton').classList.remove('hidden');
                    break;
                case 'restart':
                    document.getElementById('restartButton').classList.remove('hidden');
                    break;
            }
        });
        
        document.getElementById('gameOverlay').classList.remove('hidden');
    }
    
    hideOverlay() {
        document.getElementById('gameOverlay').classList.add('hidden');
    }
}