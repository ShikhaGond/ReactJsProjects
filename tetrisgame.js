import { useState, useEffect, useCallback, useRef } from 'react';

// Tetromino shapes and their rotations
const TETROMINOS = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: 'bg-cyan-500',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-blue-600',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-orange-500',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: 'bg-yellow-400',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: 'bg-green-500',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-purple-600',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: 'bg-red-600',
  }
};

// Game constants
const STAGE_WIDTH = 10;
const STAGE_HEIGHT = 20;
const INITIAL_DROP_TIME = 1000;
const SPEED_INCREASE = 50;
const MIN_DROP_TIME = 100;

// Create an empty stage
const createStage = () =>
  Array.from(Array(STAGE_HEIGHT), () =>
    Array(STAGE_WIDTH).fill([0, 'clear'])
  );

// Randomly select a tetromino
const randomTetromino = () => {
  const tetrominos = 'IJLOSTZ';
  const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
  return TETROMINOS[randTetromino];
};

export default function TetrisGame() {
  const [stage, setStage] = useState(createStage());
  const [dropTime, setDropTime] = useState(INITIAL_DROP_TIME);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [rows, setRows] = useState(0);
  const [player, setPlayer] = useState({
    pos: { x: STAGE_WIDTH / 2 - 1, y: 0 },
    tetromino: randomTetromino(),
    collided: false,
  });
  const [nextTetromino, setNextTetromino] = useState(randomTetromino());
  const [isPaused, setIsPaused] = useState(false);
  
  const gameAreaRef = useRef(null);

  // Check if rows are complete and calculate score
  const sweepRows = useCallback((newStage) => {
    let rowsCleared = 0;
    const stage = newStage.reduce((acc, row) => {
      if (row.every(cell => cell[0] !== 0)) {
        rowsCleared += 1;
        acc.unshift(new Array(STAGE_WIDTH).fill([0, 'clear']));
        return acc;
      }
      acc.push(row);
      return acc;
    }, []);
    
    if (rowsCleared > 0) {
      // Calculate score - more points for multiple rows at once
      let pointsScored = 0;
      switch (rowsCleared) {
        case 1: pointsScored = 40 * level; break;
        case 2: pointsScored = 100 * level; break;
        case 3: pointsScored = 300 * level; break;
        case 4: pointsScored = 1200 * level; break;
        default: pointsScored = 0;
      }
      
      setScore(prev => prev + pointsScored);
      setRows(prev => {
        const newRows = prev + rowsCleared;
        if (Math.floor(newRows / 10) > Math.floor(prev / 10)) {
          // Level up!
          setLevel(prev => prev + 1);
          // Speed up!
          setDropTime(prevTime => Math.max(prevTime - SPEED_INCREASE, MIN_DROP_TIME));
        }
        return newRows;
      });
    }
    
    return stage;
  }, [level]);

  // Check for collision
  const checkCollision = useCallback((player, stage, { x: moveX, y: moveY }) => {
    for (let y = 0; y < player.tetromino.shape.length; y++) {
      for (let x = 0; x < player.tetromino.shape[y].length; x++) {
        // Skip empty cells
        if (!player.tetromino.shape[y][x]) continue;
        
        // Check if our move is inside the game area's height and width
        if (
          !stage[y + player.pos.y + moveY] ||
          !stage[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
          stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !== 'clear'
        ) {
          return true;
        }
      }
    }
    return false;
  }, []);
  
  // Update the stage
  const updateStage = useCallback(() => {
    // First flush the stage
    const newStage = stage.map(row =>
      row.map(cell => (cell[1] === 'clear' ? [0, 'clear'] : cell))
    );

    // Draw the tetromino
    player.tetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          newStage[y + player.pos.y][x + player.pos.x] = [
            value,
            `${player.collided ? 'merged' : 'clear'}`,
            player.tetromino.color,
          ];
        }
      });
    });
    
    // Check if we collided
    if (player.collided) {
      // Get new random tetromino
      resetPlayer();
      // Check for completed rows
      return sweepRows(newStage);
    }
    
    return newStage;
  }, [player, sweepRows]);

  // Reset player position and get new tetromino
  const resetPlayer = useCallback(() => {
    setPlayer({
      pos: { x: STAGE_WIDTH / 2 - 1, y: 0 },
      tetromino: nextTetromino,
      collided: false,
    });
    
    setNextTetromino(randomTetromino());
  }, [nextTetromino]);

  // Rotate tetromino
  const rotate = (matrix, dir) => {
    // Make the rows become columns (transpose)
    const rotatedTetro = matrix.map((_, index) =>
      matrix.map(col => col[index])
    );
    
    // Reverse each row to get a rotated matrix
    if (dir > 0) return rotatedTetro.map(row => row.reverse());
    return rotatedTetro.reverse();
  };

  const playerRotate = (stage, dir) => {
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.tetromino.shape = rotate(clonedPlayer.tetromino.shape, dir);
    
    // This one is so the player can't rotate into the walls or other tetrominos
    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.tetromino.shape[0].length) {
        rotate(clonedPlayer.tetromino.shape, -dir);
        clonedPlayer.pos.x = pos;
        return;
      }
    }
    
    setPlayer(clonedPlayer);
  };

  // Move player horizontally
  const movePlayer = (dir) => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      setPlayer(prev => ({
        ...prev,
        pos: { x: prev.pos.x + dir, y: prev.pos.y }
      }));
    }
  };

  // Move player down
  const dropPlayer = () => {
    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      setPlayer(prev => ({
        ...prev,
        pos: { x: prev.pos.x, y: prev.pos.y + 1 }
      }));
    } else {
      // Game over condition
      if (player.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
      }
      // Player has collided
      setPlayer(prev => ({
        ...prev,
        collided: true,
      }));
    }
  };

  // Drop player all the way down
  const hardDrop = () => {
    let newY = player.pos.y;
    while (!checkCollision(player, stage, { x: 0, y: 1 + newY - player.pos.y })) {
      newY++;
    }
    
    setPlayer(prev => ({
      ...prev,
      pos: { x: prev.pos.x, y: newY },
      collided: true
    }));
  };

  // Handle key presses
  const handleKeyDown = useCallback((e) => {
    if (gameOver || isPaused) return;
    
    switch (e.keyCode) {
      case 37: // Left Arrow
        movePlayer(-1);
        break;
      case 39: // Right Arrow
        movePlayer(1);
        break;
      case 40: // Down Arrow
        dropPlayer();
        break;
      case 38: // Up Arrow
        playerRotate(stage, 1);
        break;
      case 32: // Space
        hardDrop();
        break;
      case 80: // P key
        setIsPaused(prev => !prev);
        break;
      default:
        break;
    }
  }, [stage, gameOver, isPaused, movePlayer, dropPlayer, playerRotate, hardDrop]);

  // Start the game
  const startGame = () => {
    // Reset everything
    setStage(createStage());
    setDropTime(INITIAL_DROP_TIME);
    resetPlayer();
    setGameOver(false);
    setScore(0);
    setRows(0);
    setLevel(1);
    setIsPaused(false);
    if (gameAreaRef.current) {
      gameAreaRef.current.focus();
    }
  };

  // Handle drop interval
  useEffect(() => {
    let dropInterval = null;
    
    if (!gameOver && !isPaused && dropTime) {
      dropInterval = setInterval(() => {
        dropPlayer();
      }, dropTime);
    }
    
    return () => {
      clearInterval(dropInterval);
    };
  }, [gameOver, isPaused, dropTime, dropPlayer]);

  // Update the stage on each render
  useEffect(() => {
    if (!gameOver) {
      setStage(prev => updateStage(prev));
    }
  }, [player, updateStage, gameOver]);
  
  // Set up keyboard events
  useEffect(() => {
    if (gameAreaRef.current) {
      gameAreaRef.current.focus();
    }
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Render game controls for mobile
  const renderMobileControls = () => (
    <div className="flex flex-col w-full mt-4">
      <div className="flex justify-center mb-2">
        <button
          className="w-12 h-12 bg-gray-700 rounded-full text-white text-xl flex items-center justify-center"
          onClick={() => playerRotate(stage, 1)}
        >
          &#8635;
        </button>
      </div>
      
      <div className="flex justify-between">
        <button
          className="w-12 h-12 bg-gray-700 rounded-full text-white text-xl flex items-center justify-center"
          onClick={() => movePlayer(-1)}
        >
          &#8592;
        </button>
        
        <button
          className="w-12 h-12 bg-gray-700 rounded-full text-white text-xl flex items-center justify-center"
          onClick={() => dropPlayer()}
        >
          &#8595;
        </button>
        
        <button
          className="w-12 h-12 bg-gray-700 rounded-full text-white text-xl flex items-center justify-center"
          onClick={() => movePlayer(1)}
        >
          &#8594;
        </button>
      </div>
      
      <div className="flex justify-center mt-2">
        <button
          className="w-24 h-12 bg-gray-700 rounded-full text-white text-lg flex items-center justify-center"
          onClick={hardDrop}
        >
          DROP
        </button>
      </div>
    </div>
  );

  // Render the next tetromino preview
  const renderNextTetromino = () => {
    const shape = nextTetromino.shape;
    const color = nextTetromino.color;
    
    return (
      <div className="bg-gray-800 p-2 rounded mb-4">
        <h3 className="text-white text-center mb-2">Next</h3>
        <div className="flex justify-center">
          <div className="grid gap-0" style={{ 
            gridTemplateRows: `repeat(${shape.length}, 16px)`,
            gridTemplateColumns: `repeat(${shape[0].length}, 16px)`
          }}>
            {shape.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`next-${y}-${x}`}
                  className={`w-4 h-4 border border-gray-900 ${cell ? color : 'bg-transparent'}`}
                />
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <h1 className="text-3xl font-bold text-white mb-4">React Tetris</h1>
      
      <div className="flex flex-col md:flex-row">
        <div className="relative">
          <div 
            ref={gameAreaRef}
            className="w-64 h-80 bg-gray-800 border-2 border-gray-700 outline-none"
            tabIndex={0}
          >
            {/* Game Stage */}
            <div className="grid grid-cols-10 gap-0">
              {stage.map((row, y) => 
                row.map((cell, x) => (
                  <div
                    key={`${y}-${x}`}
                    className={`w-6 h-4 border border-gray-900 ${cell[0] !== 0 ? cell[2] : 'bg-gray-800'}`}
                  />
                ))
              )}
            </div>
            
            {/* Game Over Overlay */}
            {gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center">
                <p className="text-red-500 text-2xl font-bold mb-4">Game Over!</p>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={startGame}
                >
                  Play Again
                </button>
              </div>
            )}
            
            {/* Pause Overlay */}
            {isPaused && !gameOver && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                <p className="text-yellow-400 text-2xl font-bold">PAUSED</p>
              </div>
            )}
          </div>
          
          {/* Mobile Controls */}
          <div className="md:hidden">
            {renderMobileControls()}
          </div>
        </div>
        
        {/* Side Panel */}
        <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-center">
          {/* Game Controls */}
          <div className="mb-4 text-center">
            <button 
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
              onClick={startGame}
            >
              {gameOver ? 'Play Again' : 'Start Game'}
            </button>
            
            {!gameOver && (
              <button 
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => setIsPaused(prev => !prev)}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
          </div>
          
          {/* Next Tetromino */}
          {renderNextTetromino()}
          
          {/* Stats */}
          <div className="bg-gray-800 p-4 rounded w-full">
            <div className="text-white mb-2">
              <span className="font-bold">Score:</span> {score}
            </div>
            <div className="text-white mb-2">
              <span className="font-bold">Level:</span> {level}
            </div>
            <div className="text-white">
              <span className="font-bold">Lines:</span> {rows}
            </div>
          </div>
          
          {/* Instructions */}
          <div className="mt-4 bg-gray-800 p-4 rounded w-full text-white text-sm">
            <h3 className="font-bold mb-2">Controls:</h3>
            <ul>
              <li>← → : Move</li>
              <li>↑ : Rotate</li>
              <li>↓ : Move Down</li>
              <li>Space : Hard Drop</li>
              <li>P : Pause</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
