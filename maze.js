/**
 * ScammerMaze - Maze Generation and Rendering Engine
 * Built to waste scammers' time with increasingly complex maze puzzles
 */

class MazeGenerator {
    constructor(width, height, difficulty = 'medium') {
        this.width = width;
        this.height = height;
        this.difficulty = difficulty;
        this.maze = [];
        this.traps = [];
        this.falseExits = [];
        this.teleporters = [];
        
        // Difficulty settings
        this.difficultySettings = {
            easy: { trapDensity: 0.05, falseExitCount: 1, teleporterCount: 0, deadEndBonus: 0.1 },
            medium: { trapDensity: 0.1, falseExitCount: 2, teleporterCount: 1, deadEndBonus: 0.2 },
            hard: { trapDensity: 0.15, falseExitCount: 3, teleporterCount: 2, deadEndBonus: 0.3 },
            impossible: { trapDensity: 0.25, falseExitCount: 5, teleporterCount: 4, deadEndBonus: 0.5 }
        };
        
        this.settings = this.difficultySettings[difficulty];
        this.generateMaze();
    }
    
    generateMaze() {
        // Initialize maze with all walls
        this.maze = Array(this.height).fill().map(() => Array(this.width).fill(1));
        
        // Create the maze using recursive backtracking
        this.recursiveBacktrack(1, 1);
        
        // Add entrance and exit
        this.maze[1][0] = 0; // Entrance
        this.maze[this.height - 2][this.width - 1] = 0; // Exit
        
        // Add scammer-specific traps
        this.addTraps();
        this.addFalseExits();
        this.addTeleporters();
        this.addDeadEndExtensions();
    }
    
    recursiveBacktrack(x, y) {
        this.maze[y][x] = 0; // Mark as path
        
        // Get random directions
        const directions = this.shuffleArray([
            [0, -2], [2, 0], [0, 2], [-2, 0]
        ]);
        
        for (let [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (this.isValidCell(nx, ny) && this.maze[ny][nx] === 1) {
                // Remove wall between current and next cell
                this.maze[y + dy/2][x + dx/2] = 0;
                this.recursiveBacktrack(nx, ny);
            }
        }
    }
    
    isValidCell(x, y) {
        return x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1;
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    addTraps() {
        const pathCells = this.getPathCells();
        const trapCount = Math.floor(pathCells.length * this.settings.trapDensity);
        
        for (let i = 0; i < trapCount; i++) {
            if (pathCells.length === 0) break;
            
            const randomIndex = Math.floor(Math.random() * pathCells.length);
            const [x, y] = pathCells.splice(randomIndex, 1)[0];
            
            this.traps.push({
                x, y,
                type: this.getRandomTrapType(),
                triggered: false
            });
        }
    }
    
    addFalseExits() {
        const walls = this.getWallCells();
        const exitCount = this.settings.falseExitCount;
        
        for (let i = 0; i < exitCount && walls.length > 0; i++) {
            // Find walls on the perimeter
            const perimeterWalls = walls.filter(([x, y]) => 
                x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1
            );
            
            if (perimeterWalls.length > 0) {
                const randomIndex = Math.floor(Math.random() * perimeterWalls.length);
                const [x, y] = perimeterWalls[randomIndex];
                
                this.falseExits.push({ x, y, discovered: false });
                walls.splice(walls.indexOf([x, y]), 1);
            }
        }
    }
    
    addTeleporters() {
        const pathCells = this.getPathCells();
        const teleporterCount = this.settings.teleporterCount;
        
        for (let i = 0; i < teleporterCount && pathCells.length >= 2; i++) {
            // Create pairs of teleporters
            const entrance = pathCells.splice(Math.floor(Math.random() * pathCells.length), 1)[0];
            const exit = pathCells.splice(Math.floor(Math.random() * pathCells.length), 1)[0];
            
            this.teleporters.push({
                entrance: { x: entrance[0], y: entrance[1] },
                exit: { x: exit[0], y: exit[1] },
                used: false
            });
        }
    }
    
    addDeadEndExtensions() {
        // Add extra dead ends to waste more time
        const deadEnds = this.findDeadEnds();
        const extensionCount = Math.floor(deadEnds.length * this.settings.deadEndBonus);
        
        for (let i = 0; i < extensionCount; i++) {
            this.extendDeadEnd(deadEnds[i]);
        }
    }
    
    findDeadEnds() {
        const deadEnds = [];
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                if (this.maze[y][x] === 0) {
                    const neighbors = this.getNeighborWalls(x, y);
                    if (neighbors.length === 3) { // Dead end has 3 walls around it
                        deadEnds.push([x, y]);
                    }
                }
            }
        }
        return deadEnds;
    }
    
    extendDeadEnd([x, y]) {
        const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        const shuffledDirections = this.shuffleArray(directions);
        
        for (let [dx, dy] of shuffledDirections) {
            const nx = x + dx * 2;
            const ny = y + dy * 2;
            
            if (this.isValidCell(nx, ny) && this.maze[ny][nx] === 1) {
                this.maze[y + dy][x + dx] = 0;
                this.maze[ny][nx] = 0;
                break;
            }
        }
    }
    
    getNeighborWalls(x, y) {
        const walls = [];
        const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        
        for (let [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height && this.maze[ny][nx] === 1) {
                walls.push([nx, ny]);
            }
        }
        return walls;
    }
    
    getPathCells() {
        const paths = [];
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                if (this.maze[y][x] === 0) {
                    paths.push([x, y]);
                }
            }
        }
        return paths;
    }
    
    getWallCells() {
        const walls = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.maze[y][x] === 1) {
                    walls.push([x, y]);
                }
            }
        }
        return walls;
    }
    
    getRandomTrapType() {
        const types = ['slow', 'teleport', 'confusion', 'fake_exit'];
        return types[Math.floor(Math.random() * types.length)];
    }
    
    // Check if position has a trap
    hasTrap(x, y) {
        return this.traps.find(trap => trap.x === x && trap.y === y && !trap.triggered);
    }
    
    // Check if position has a teleporter
    hasTeleporter(x, y) {
        return this.teleporters.find(tp => 
            (tp.entrance.x === x && tp.entrance.y === y) ||
            (tp.exit.x === x && tp.exit.y === y)
        );
    }
    
    // Check if position is a false exit
    isFalseExit(x, y) {
        return this.falseExits.find(exit => exit.x === x && exit.y === y && !exit.discovered);
    }
    
    // Trigger a trap
    triggerTrap(x, y) {
        const trap = this.hasTrap(x, y);
        if (trap) {
            trap.triggered = true;
            return trap;
        }
        return null;
    }
    
    // Use teleporter
    useTeleporter(x, y) {
        const teleporter = this.hasTeleporter(x, y);
        if (teleporter && !teleporter.used) {
            teleporter.used = true;
            if (teleporter.entrance.x === x && teleporter.entrance.y === y) {
                return teleporter.exit;
            } else {
                return teleporter.entrance;
            }
        }
        return null;
    }
}

class MazeRenderer {
    constructor(canvas, cellSize = 20) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = cellSize;
        this.animationFrame = null;
        
        // Colors
        this.colors = {
            wall: '#00ff00',
            path: '#000000',
            player: '#ffff00',
            exit: '#ff00ff',
            trap: '#ff6600',
            falseExit: '#ff0000',
            teleporter: '#00ffff',
            visited: '#003300'
        };
    }
    
    render(maze, player, visited = new Set()) {
        const mazeData = maze.maze;
        const width = mazeData[0].length;
        const height = mazeData.length;
        
        // Resize canvas
        this.canvas.width = width * this.cellSize;
        this.canvas.height = height * this.cellSize;
        
        // Clear canvas
        this.ctx.fillStyle = this.colors.wall;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw maze
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cellX = x * this.cellSize;
                const cellY = y * this.cellSize;
                
                if (mazeData[y][x] === 0) { // Path
                    // Show visited paths
                    if (visited.has(`${x},${y}`)) {
                        this.ctx.fillStyle = this.colors.visited;
                    } else {
                        this.ctx.fillStyle = this.colors.path;
                    }
                    this.ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
                    
                    // Draw special elements
                    this.drawSpecialElements(maze, x, y, cellX, cellY);
                }
            }
        }
        
        // Draw exit
        this.ctx.fillStyle = this.colors.exit;
        this.ctx.fillRect((width - 1) * this.cellSize, (height - 2) * this.cellSize, this.cellSize, this.cellSize);
        
        // Draw player
        this.drawPlayer(player);
        
        // Draw entrance indicator
        this.ctx.fillStyle = this.colors.player;
        this.ctx.fillRect(0, this.cellSize, this.cellSize, this.cellSize);
    }
    
    drawSpecialElements(maze, x, y, cellX, cellY) {
        const centerX = cellX + this.cellSize / 2;
        const centerY = cellY + this.cellSize / 2;
        const radius = this.cellSize / 4;
        
        // Draw traps
        if (maze.hasTrap(x, y)) {
            this.ctx.fillStyle = this.colors.trap;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            this.ctx.fill();
        }
        
        // Draw teleporters
        if (maze.hasTeleporter(x, y)) {
            this.ctx.fillStyle = this.colors.teleporter;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Add swirl effect
            this.ctx.strokeStyle = this.colors.teleporter;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI);
            this.ctx.stroke();
        }
        
        // Draw false exits
        if (maze.isFalseExit(x, y)) {
            this.ctx.fillStyle = this.colors.falseExit;
            this.ctx.fillRect(cellX, cellY, this.cellSize, this.cellSize);
            
            // Add X mark
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(cellX + 2, cellY + 2);
            this.ctx.lineTo(cellX + this.cellSize - 2, cellY + this.cellSize - 2);
            this.ctx.moveTo(cellX + this.cellSize - 2, cellY + 2);
            this.ctx.lineTo(cellX + 2, cellY + this.cellSize - 2);
            this.ctx.stroke();
        }
    }
    
    drawPlayer(player) {
        const centerX = player.x * this.cellSize + this.cellSize / 2;
        const centerY = player.y * this.cellSize + this.cellSize / 2;
        
        // Player glow effect
        this.ctx.shadowColor = this.colors.player;
        this.ctx.shadowBlur = 10;
        
        this.ctx.fillStyle = this.colors.player;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.cellSize / 3, 0, 2 * Math.PI);
        this.ctx.fill();
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
        
        // Add direction indicator
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.cellSize / 6, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    
    // Animation methods for trap effects
    animateTrap(x, y, type) {
        const cellX = x * this.cellSize;
        const cellY = y * this.cellSize;
        
        switch (type) {
            case 'slow':
                this.animateSlowTrap(cellX, cellY);
                break;
            case 'teleport':
                this.animateTeleportTrap(cellX, cellY);
                break;
            case 'confusion':
                this.animateConfusionTrap(cellX, cellY);
                break;
        }
    }
    
    animateSlowTrap(x, y) {
        // Create slowing visual effect
        this.ctx.fillStyle = 'rgba(255, 102, 0, 0.5)';
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
    }
    
    animateTeleportTrap(x, y) {
        // Create teleport swirl effect
        const centerX = x + this.cellSize / 2;
        const centerY = y + this.cellSize / 2;
        
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.cellSize / 2, 0, 2 * Math.PI);
        this.ctx.stroke();
    }
    
    animateConfusionTrap(x, y) {
        // Create confusion static effect
        for (let i = 0; i < 10; i++) {
            this.ctx.fillStyle = Math.random() > 0.5 ? '#ffffff' : '#000000';
            this.ctx.fillRect(
                x + Math.random() * this.cellSize,
                y + Math.random() * this.cellSize,
                2, 2
            );
        }
    }
}