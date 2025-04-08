import { useState, useEffect, useRef } from 'react';

export default function JungleDash() {
  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [playerY, setPlayerY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState([]);
  
  // Game settings
  const playerHeight = 50;
  const playerWidth = 30;
  const groundLevel = 20;
  const jumpHeight = 120;
  const jumpDuration = 700;
  const gravity = 0.6;
  const obstacleWidth = 30;
  const obstacleMinHeight = 30;
  const obstacleMaxHeight = 60;
  const gameSpeed = 5;
  
  const gameLoopRef = useRef(null);
  const obstacleTimerRef = useRef(null);
  const scoreTimerRef = useRef(null);
  
  // Handle player jump
  const jump = () => {
    if (!isJumping && isPlaying && !gameOver) {
      setIsJumping(true);
      
      // Jump animation
      let jumpVelocity = 15;
      let jumpInterval;
      
      const performJump = () => {
        setPlayerY(prevY => {
          const newY = prevY + jumpVelocity;
          jumpVelocity -= gravity;
          
          // Check if player has landed
          if (newY <= 0 && jumpVelocity < 0) {
            setIsJumping(false);
            clearInterval(jumpInterval);
            return 0;
          }
          
          return newY;
        });
      };
      
      jumpInterval = setInterval(performJump, 30);
      
      // Safety timeout to end jump if something goes wrong
      setTimeout(() => {
        clearInterval(jumpInterval);
        setIsJumping(false);
        setPlayerY(0);
      }, jumpDuration);
    }
  };
  
  // Start game
  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setPlayerY(0);
    setIsJumping(false);
    setObstacles([]);
    
    // Create obstacles at intervals
    obstacleTimerRef.current = setInterval(() => {
      const height = Math.floor(Math.random() * (obstacleMaxHeight - obstacleMinHeight)) + obstacleMinHeight;
      setObstacles(prevObstacles => [
        ...prevObstacles,
        {
          x: 800,
          height,
          passed: false
        }
      ]);
    }, 1500);
    
    // Increment score over time
    scoreTimerRef.current = setInterval(() => {
      setScore(prevScore => prevScore + 1);
    }, 100);
    
    // Game loop
    gameLoopRef.current = setInterval(() => {
      // Move obstacles
      setObstacles(prevObstacles => {
        return prevObstacles
          .map(obstacle => ({
            ...obstacle,
            x: obstacle.x - gameSpeed,
            // Mark obstacle as passed when it passes the player
            passed: obstacle.passed || obstacle.x < 100 - obstacleWidth
          }))
          .filter(obstacle => obstacle.x > -obstacleWidth); // Remove obstacles that have left the screen
      });
      
      // Check collision
      setObstacles(prevObstacles => {
        const collided = prevObstacles.some(obstacle => {
          const playerBottom = playerY;
          const obstacleLeft = obstacle.x;
          const obstacleRight = obstacle.x + obstacleWidth;
          
          return (
            obstacleLeft < 100 + playerWidth &&
            obstacleRight > 100 &&
            playerBottom < obstacle.height
          );
        });
        
        if (collided) {
          endGame();
        }
        
        return prevObstacles;
      });
    }, 20);
  };
  
  // End game
  const endGame = () => {
    setIsPlaying(false);
    setGameOver(true);
    
    // Update high score
    setHighScore(prevHighScore => Math.max(prevHighScore, score));
    
    // Clear all intervals
    clearInterval(gameLoopRef.current);
    clearInterval(obstacleTimerRef.current);
    clearInterval(scoreTimerRef.current);
  };
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      clearInterval(gameLoopRef.current);
      clearInterval(obstacleTimerRef.current);
      clearInterval(scoreTimerRef.current);
    };
  }, []);
  
  // Key handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isPlaying && !gameOver) {
          startGame();
        } else {
          jump();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, gameOver, isJumping]);
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-900">
      <div className="relative w-full max-w-2xl h-64 bg-green-800 overflow-hidden rounded-lg shadow-lg border-2 border-yellow-600">
        {/* Sky and jungle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-green-400" />
        
        {/* Game info */}
        <div className="absolute top-2 left-2 text-white font-bold">
          Score: {score}
        </div>
        <div className="absolute top-2 right-2 text-white font-bold">
          High Score: {highScore}
        </div>
        
        {/* Player character */}
        <div 
          className="absolute w-8 h-12 bg-yellow-600 rounded-t-lg"
          style={{
            bottom: `${groundLevel + playerY}px`,
            left: '100px',
          }}
        >
          {/* Player face */}
          <div className="absolute top-1 left-1 w-2 h-2 bg-black rounded-full" />
          <div className="absolute top-1 right-1 w-2 h-2 bg-black rounded-full" />
          <div className="absolute bottom-2 left-2 w-4 h-1 bg-black rounded-full" />
        </div>
        
        {/* Ground */}
        <div className="absolute bottom-0 w-full h-5 bg-brown-700 border-t-2 border-green-900" />
        
        {/* Trees and plants (decorative) */}
        <div className="absolute bottom-5 left-10 w-8 h-20 bg-green-900 rounded-b-lg" />
        <div className="absolute bottom-5 left-12 w-20 h-14 bg-green-700 rounded-full" />
        <div className="absolute bottom-5 right-20 w-6 h-16 bg-green-900 rounded-b-lg" />
        <div className="absolute bottom-5 right-22 w-16 h-12 bg-green-700 rounded-full" />
        
        {/* Obstacles */}
        {obstacles.map((obstacle, index) => (
          <div
            key={index}
            className="absolute bg-red-800 rounded-sm"
            style={{
              left: `${obstacle.x}px`,
              bottom: `${groundLevel}px`,
              width: `${obstacleWidth}px`,
              height: `${obstacle.height}px`,
            }}
          />
        ))}
        
        {/* Game messages */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-70 p-4 rounded-lg text-white text-center">
              <h2 className="text-xl font-bold mb-2">Jungle Dash</h2>
              <p className="mb-4">Press Space to start</p>
              <button 
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-500"
                onClick={startGame}
              >
                Start Game
              </button>
            </div>
          </div>
        )}
        
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-70 p-4 rounded-lg text-white text-center">
              <h2 className="text-xl font-bold mb-2">Game Over!</h2>
              <p className="mb-2">Score: {score}</p>
              <p className="mb-4">High Score: {highScore}</p>
              <button 
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-500"
                onClick={startGame}
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Game controls */}
      <div className="mt-6">
        <button 
          className="bg-yellow-600 text-white px-6 py-3 rounded-full text-lg font-bold mr-4 hover:bg-yellow-500"
          onClick={isPlaying ? jump : startGame}
        >
          {isPlaying ? "Jump" : "Start"}
        </button>
        
        {isPlaying && (
          <button 
            className="bg-red-600 text-white px-6 py-3 rounded-full text-lg font-bold hover:bg-red-500"
            onClick={endGame}
          >
            End Game
          </button>
        )}
      </div>
      
      <div className="mt-4 text-white text-center">
        <p>Use Space bar or Up arrow key to jump</p>
        <p>Avoid the obstacles and survive as long as possible!</p>
      </div>
    </div>
  );
}
