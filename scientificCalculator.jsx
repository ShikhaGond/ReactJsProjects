import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ScientificCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState(0);
  const [waitingForOperand, setWaitingForOperand] = useState(true);
  const [previousOperator, setPreviousOperator] = useState(null);
  const [previousValue, setPreviousValue] = useState(null);
  const [showMemory, setShowMemory] = useState(false);

  const clearAll = () => {
    setDisplay('0');
    setWaitingForOperand(true);
    setPreviousOperator(null);
    setPreviousValue(null);
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setWaitingForOperand(true);
    }
  };

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const performOperation = (nextOperator) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (previousOperator) {
      const currentValue = previousValue || 0;
      const newValue = calculateOperation(currentValue, inputValue, previousOperator);
      setPreviousValue(newValue);
      setDisplay(String(newValue));
    }

    setWaitingForOperand(true);
    setPreviousOperator(nextOperator);
  };

  const calculateOperation = (firstValue, secondValue, operator) => {
    switch (operator) {
      case '+': return firstValue + secondValue;
      case '-': return firstValue - secondValue;
      case '×': return firstValue * secondValue;
      case '÷': return firstValue / secondValue;
      default: return secondValue;
    }
  };

  const handleScientificOperation = (operation) => {
    const inputValue = parseFloat(display);
    let result;

    switch (operation) {
      case 'sin':
        result = Math.sin(inputValue * (Math.PI / 180));
        break;
      case 'cos':
        result = Math.cos(inputValue * (Math.PI / 180));
        break;
      case 'tan':
        result = Math.tan(inputValue * (Math.PI / 180));
        break;
      case 'asin':
        result = Math.asin(inputValue) * (180 / Math.PI);
        break;
      case 'acos':
        result = Math.acos(inputValue) * (180 / Math.PI);
        break;
      case 'atan':
        result = Math.atan(inputValue) * (180 / Math.PI);
        break;
      case 'sqrt':
        result = Math.sqrt(inputValue);
        break;
      case 'log':
        result = Math.log10(inputValue);
        break;
      case 'ln':
        result = Math.log(inputValue);
        break;
      case 'pow2':
        result = Math.pow(inputValue, 2);
        break;
      case 'pow3':
        result = Math.pow(inputValue, 3);
        break;
      case 'exp':
        result = Math.exp(inputValue);
        break;
      case '1/x':
        result = 1 / inputValue;
        break;
      default:
        return;
    }

    setDisplay(String(result));
    setWaitingForOperand(true);
  };

  const handleMemoryOperation = (operation) => {
    const currentValue = parseFloat(display);
    
    switch (operation) {
      case 'MC':
        setMemory(0);
        setShowMemory(false);
        break;
      case 'MR':
        setDisplay(String(memory));
        setWaitingForOperand(true);
        break;
      case 'M+':
        setMemory(memory + currentValue);
        setShowMemory(true);
        setWaitingForOperand(true);
        break;
      case 'M-':
        setMemory(memory - currentValue);
        setShowMemory(true);
        setWaitingForOperand(true);
        break;
    }
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      const { key } = event;
      
      if (/[0-9]/.test(key)) {
        inputDigit(parseInt(key));
      } else {
        switch (key) {
          case '.':
            inputDecimal();
            break;
          case '+':
          case '-':
            performOperation(key);
            break;
          case '*':
            performOperation('×');
            break;
          case '/':
            performOperation('÷');
            break;
          case 'Enter':
            performOperation('=');
            break;
          case 'Backspace':
            backspace();
            break;
          case 'Escape':
            clearAll();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [display, previousValue, previousOperator]);

  const buttonStyle = "h-10 text-sm font-medium transition-colors duration-200";
  const operatorStyle = "bg-blue-500 text-white hover:bg-blue-600";
  const numberStyle = "bg-gray-100 hover:bg-gray-200 text-gray-900";
  const scientificStyle = "bg-purple-500 text-white hover:bg-purple-600";
  const memoryStyle = "bg-green-500 text-white hover:bg-green-600";
  const dangerStyle = "bg-red-500 text-white hover:bg-red-600";

  return (
    <Card className="w-[420px] bg-white shadow-xl">
      <CardContent className="p-4">
        <div className="h-6 text-right text-sm text-gray-500">
          {showMemory && `M = ${memory}`}
        </div>
        
        <div className="mb-4">
          <div className="bg-gray-50 p-4 text-right text-3xl font-mono rounded-lg border overflow-x-auto">
            {display}
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 mb-2">
          <Button className={`${buttonStyle} ${memoryStyle}`} onClick={() => handleMemoryOperation('MC')}>MC</Button>
          <Button className={`${buttonStyle} ${memoryStyle}`} onClick={() => handleMemoryOperation('MR')}>MR</Button>
          <Button className={`${buttonStyle} ${memoryStyle}`} onClick={() => handleMemoryOperation('M+')}>M+</Button>
          <Button className={`${buttonStyle} ${memoryStyle}`} onClick={() => handleMemoryOperation('M-')}>M-</Button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-2">
          <Button className={`${buttonStyle} ${scientificStyle}`} onClick={() => handleScientificOperation('sin')}>sin</Button>
          <Button className={`${buttonStyle} ${scientificStyle}`} onClick={() => handleScientificOperation('cos')}>cos</Button>
          <Button className={`${buttonStyle} ${scientificStyle}`} onClick={() => handleScientificOperation('tan')}>tan</Button>
          <Button className={`${buttonStyle} ${scientificStyle}`} onClick={() => handleScientificOperation('sqrt')}>√</Button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-2">
          <Button className={`${buttonStyle} ${scientificStyle}`} onClick={() => handleScientificOperation('asin')}>sin⁻¹</Button>
          <Button className={`${buttonStyle} ${scientificStyle}`} onClick={() => handleScientificOperation('acos')}>cos⁻¹</Button>
          <Button className={`${buttonStyle} ${scientificStyle}`} onClick={() => handleScientificOperation('atan')}>tan⁻¹</Button>
          <Button className={`${buttonStyle} ${scientificStyle}`} onClick={() => handleScientificOperation('1/x')}>1/x</Button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-2">
          <Button className={`${buttonStyle} ${scientificStyle}`} onClick={() => handleScientificOperation('log')}>log</Button>
          <Button className={`${buttonStyle} ${scientificStyle}`} onClick={() => handleScientificOperation('ln')}>ln</Button>
          <Button className={`${buttonStyle} ${scientificStyle}`} onClick={() => handleScientificOperation('pow2')}>x²</Button>
          <Button className={`${buttonStyle} ${scientificStyle}`} onClick={() => handleScientificOperation('pow3')}>x³</Button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Button className={`${buttonStyle} ${dangerStyle}`} onClick={clearAll}>
            AC
          </Button>
          <Button className={`${buttonStyle} ${dangerStyle}`} onClick={backspace}>
            ⌫
          </Button>
          <Button className={`${buttonStyle} ${operatorStyle}`} onClick={() => handleScientificOperation('exp')}>exp</Button>
          <Button className={`${buttonStyle} ${operatorStyle}`} onClick={() => performOperation('÷')}>÷</Button>

          <Button className={`${buttonStyle} ${numberStyle}`} onClick={() => inputDigit(7)}>7</Button>
          <Button className={`${buttonStyle} ${numberStyle}`} onClick={() => inputDigit(8)}>8</Button>
          <Button className={`${buttonStyle} ${numberStyle}`} onClick={() => inputDigit(9)}>9</Button>
          <Button className={`${buttonStyle} ${operatorStyle}`} onClick={() => performOperation('×')}>×</Button>

          <Button className={`${buttonStyle} ${numberStyle}`} onClick={() => inputDigit(4)}>4</Button>
          <Button className={`${buttonStyle} ${numberStyle}`} onClick={() => inputDigit(5)}>5</Button>
          <Button className={`${buttonStyle} ${numberStyle}`} onClick={() => inputDigit(6)}>6</Button>
          <Button className={`${buttonStyle} ${operatorStyle}`} onClick={() => performOperation('-')}>-</Button>

          <Button className={`${buttonStyle} ${numberStyle}`} onClick={() => inputDigit(1)}>1</Button>
          <Button className={`${buttonStyle} ${numberStyle}`} onClick={() => inputDigit(2)}>2</Button>
          <Button className={`${buttonStyle} ${numberStyle}`} onClick={() => inputDigit(3)}>3</Button>
          <Button className={`${buttonStyle} ${operatorStyle}`} onClick={() => performOperation('+')}>+</Button>

          <Button className={`${buttonStyle} ${numberStyle}`} onClick={() => inputDigit(0)}>0</Button>
          <Button className={`${buttonStyle} ${numberStyle}`} onClick={inputDecimal}>.</Button>
          <Button className={`${buttonStyle} ${numberStyle}`} onClick={() => handleScientificOperation('1/x')}>1/x</Button>
          <Button className={`${buttonStyle} ${operatorStyle}`} onClick={() => performOperation('=')}>=</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScientificCalculator;
