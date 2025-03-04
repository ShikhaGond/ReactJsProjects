import React, { useState, useEffect } from 'react';

const Timer = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRunning]);

  // Format time to display hours:minutes:seconds
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [hours, minutes, seconds]
      .map(v => v.toString().padStart(2, '0'))
      .join(':');
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold mb-4">React Timer</h1>
        <div className="text-4xl font-mono mb-6">
          {formatTime(time)}
        </div>
      </div>
      <div className="flex justify-center space-x-4">
        {!isRunning ? (
          <button 
            onClick={handleStart} 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Start
          </button>
        ) : (
          <button 
            onClick={handlePause} 
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Pause
          </button>
        )}
        <button 
          onClick={handleReset} 
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;
