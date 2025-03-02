import React, { useState, useEffect, useRef } from 'react';

const TypingTest = () => {
  const sampleTexts = [
    "The quick brown fox jumps over the lazy dog.",
    "Programming is the art of telling another human what one wants the computer to do.",
    "Coding is like poetry; it's not just a matter of putting words together but creating something beautiful.",
    "React is a JavaScript library for building user interfaces, particularly single-page applications.",
    "Practice makes perfect when it comes to improving your typing speed and accuracy.",
    "Chasing Dreams - She stood on the edge of the stage, heart pounding as the spotlight bathed her in golden light. This was the moment she had worked for, the dream she had chased since childhood. Taking a deep breath, she stepped forward, her voice filling the auditorium with a melody of passion and determination.",
    "A Cup of Coffee - The aroma of freshly brewed coffee filled the cozy café as rain drizzled outside. The barista moved swiftly, pouring creamy milk into espresso, creating a delicate swirl of patterns. The warmth of the cup was comforting, a small moment of peace in the bustling city.",
    "The Midnight Train - The station was nearly empty, save for a few weary travelers waiting for the last train. The rhythmic clatter of wheels on the tracks grew louder as the locomotive emerged from the darkness, its headlights piercing through the fog. With a hiss of steam, the doors slid open, beckoning passengers into the unknown.",
 ];

  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);

  const inputRef = useRef(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(0);

  const startTest = () => {
    const randomIndex = Math.floor(Math.random() * sampleTexts.length);
    setCurrentText(sampleTexts[randomIndex]);
    setUserInput('');
    setTimer(0);
    setWpm(0);
    setAccuracy(100);
    setIsFinished(false);
    setIsCountingDown(true);
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount === 1) {
          clearInterval(countdownInterval);
          setIsCountingDown(false);
          setIsActive(true);
          startTimeRef.current = Date.now();
          // Start the timer
          intervalRef.current = setInterval(() => {
            setTimer((prevTimer) => prevTimer + 1);
          }, 1000);
          if (inputRef.current) {
            inputRef.current.focus();
          }
          return 0;
        }
        return prevCount - 1;
      });
    }, 1000);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);

    let correctChars = 0;
    for (let i = 0; i < value.length; i++) {
      if (i < currentText.length && value[i] === currentText[i]) {
        correctChars++;
      }
    }
    const accuracyValue = value.length > 0 ? (correctChars / value.length) * 100 : 100;
    setAccuracy(Math.round(accuracyValue));

    if (value === currentText) {
      endTest();
    }
  };

  const endTest = () => {
    setIsActive(false);
    setIsFinished(true);
    clearInterval(intervalRef.current);

    const timeInMinutes = (Date.now() - startTimeRef.current) / 60000;
    const words = currentText.length / 5;
    const calculatedWpm = Math.round(words / timeInMinutes);
    setWpm(calculatedWpm);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">React Typing Test</h1>
      
      {!isActive && !isFinished && !isCountingDown && (
        <div className="text-center mb-8">
          <button 
            onClick={startTest}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Start Typing Test
          </button>
        </div>
      )}

      {isCountingDown && (
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold">Starting in {countdown}...</h2>
        </div>
      )}

      {(isActive || isFinished) && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg shadow">
          <p className="text-lg font-medium">
            {currentText.split('').map((char, index) => {
              let charClass = '';
              if (index < userInput.length) {
                charClass = userInput[index] === char ? 'text-green-600' : 'text-red-600 bg-red-100';
              }
              return (
                <span key={index} className={charClass}>
                  {char}
                </span>
              );
            })}
          </p>
        </div>
      )}

      {isActive && (
        <div className="mb-6">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            disabled={!isActive}
          />
        </div>
      )}

      <div className="flex justify-between mb-6">
        <div className="text-center p-3 bg-gray-100 rounded-lg shadow flex-1 mx-2">
          <h3 className="text-lg font-semibold">Time</h3>
          <p className="text-2xl">{timer}s</p>
        </div>
        <div className="text-center p-3 bg-gray-100 rounded-lg shadow flex-1 mx-2">
          <h3 className="text-lg font-semibold">WPM</h3>
          <p className="text-2xl">{wpm}</p>
        </div>
        <div className="text-center p-3 bg-gray-100 rounded-lg shadow flex-1 mx-2">
          <h3 className="text-lg font-semibold">Accuracy</h3>
          <p className="text-2xl">{accuracy}%</p>
        </div>
      </div>

      {isFinished && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Test Completed!</h2>
          <div className="mb-4">
            <p className="text-lg">Your typing speed: <span className="font-bold">{wpm} WPM</span></p>
            <p className="text-lg">Accuracy: <span className="font-bold">{accuracy}%</span></p>
          </div>
          <button 
            onClick={startTest}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default TypingTest;