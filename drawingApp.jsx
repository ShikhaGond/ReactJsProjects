import React, { useState, useRef, useEffect } from 'react';
import { Palette, Eraser, Circle, Square, Triangle, Type, Image, Trash, Save, Smile } from 'lucide-react';

export default function DrawingApp() {
  const canvasRef = useRef(null);
  const [ctx, setCtx] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');
  const [thickness, setThickness] = useState(5);
  const [tool, setTool] = useState('pencil');
  const [gradientMode, setGradientMode] = useState(false);
  const [shapes, setShapes] = useState([]);
  const [history, setHistory] = useState([]);
  const [emojis] = useState(['😊', '😂', '❤️', '👍', '🎨', '✨', '🔥', '🌈', '🚀', '💯', '⭐', '🌟']);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';
    setCtx(context);
    
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    const handleResize = () => {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      context.putImageData(imageData, 0, 0);
      context.lineCap = 'round';
      context.lineJoin = 'round';
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const createGradient = (x1, y1, x2, y2) => {
    if (!ctx) return;
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, secondaryColor);
    return gradient;
  };

  const startDrawing = (e) => {
    if (!ctx) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setStartPos({ x, y });
    
    if (tool === 'pencil' || tool === 'eraser') {
      setIsDrawing(true);
      ctx.beginPath();
      ctx.moveTo(x, y);
      
      saveState();
      
      if (tool === 'eraser') {
        ctx.strokeStyle = '#ffffff';
      } else if (gradientMode) {
      } else {
        ctx.strokeStyle = color;
      }
      
      ctx.lineWidth = thickness;
    } else if (tool === 'emoji') {
    }
  };

  const draw = (e) => {
    if (!isDrawing || !ctx) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (tool === 'pencil' || tool === 'eraser') {
      ctx.lineTo(x, y);
      
      if (tool === 'pencil' && gradientMode) {
        ctx.strokeStyle = createGradient(startPos.x, startPos.y, x, y);
      }
      
      ctx.stroke();
    }
  };

  const endDrawing = (e) => {
    if (!ctx) return;
    
    if (isDrawing) {
      setIsDrawing(false);
      ctx.closePath();
    }
    
    if (tool !== 'pencil' && tool !== 'eraser' && tool !== 'emoji') {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      saveState();
      
      ctx.beginPath();
      
      if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      } else if (tool === 'square') {
        const width = x - startPos.x;
        const height = y - startPos.y;
        ctx.rect(startPos.x, startPos.y, width, height);
      } else if (tool === 'triangle') {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, y);
        ctx.lineTo(startPos.x - (x - startPos.x), y);
        ctx.closePath();
      }
      
      if (gradientMode) {
        ctx.strokeStyle = createGradient(startPos.x, startPos.y, x, y);
        ctx.fillStyle = createGradient(startPos.x, startPos.y, x, y);
      } else {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
      }
      
      ctx.lineWidth = thickness;
      ctx.stroke();
      ctx.fill();
    }
  };

  const placeEmoji = (e) => {
    if (!ctx || tool !== 'emoji') return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    saveState();
    
    ctx.font = `${thickness * 5}px Arial`;
    ctx.fillText(selectedEmoji, x, y);
  };
  
  const saveState = () => {
    const canvas = canvasRef.current;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([...history, imageData]);
  };
  
  const undo = () => {
    if (history.length === 0) return;
    
    const newHistory = [...history];
    const lastState = newHistory.pop();
    
    if (lastState) {
      ctx.putImageData(lastState, 0, 0);
      setHistory(newHistory);
    }
  };
  
  const clearCanvas = () => {
    if (!ctx) return;
    
    saveState();
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };
  
  const saveCanvas = () => {
    const canvas = canvasRef.current;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'drawing.png';
    link.click();
  };
  
  const [selectedEmoji, setSelectedEmoji] = useState(emojis[0]);
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="p-4 bg-white shadow-md">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <button 
              className={`p-2 rounded ${tool === 'pencil' ? 'bg-blue-100' : 'bg-gray-200'}`}
              onClick={() => setTool('pencil')}
            >
              <Palette size={20} />
            </button>
            <button 
              className={`p-2 rounded ${tool === 'eraser' ? 'bg-blue-100' : 'bg-gray-200'}`}
              onClick={() => setTool('eraser')}
            >
              <Eraser size={20} />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              className={`p-2 rounded ${tool === 'circle' ? 'bg-blue-100' : 'bg-gray-200'}`}
              onClick={() => setTool('circle')}
            >
              <Circle size={20} />
            </button>
            <button 
              className={`p-2 rounded ${tool === 'square' ? 'bg-blue-100' : 'bg-gray-200'}`}
              onClick={() => setTool('square')}
            >
              <Square size={20} />
            </button>
            <button 
              className={`p-2 rounded ${tool === 'triangle' ? 'bg-blue-100' : 'bg-gray-200'}`}
              onClick={() => setTool('triangle')}
            >
              <Triangle size={20} />
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              className={`p-2 rounded ${tool === 'emoji' ? 'bg-blue-100' : 'bg-gray-200'}`}
              onClick={() => setTool('emoji')}
            >
              <Smile size={20} />
            </button>
            {tool === 'emoji' && (
              <div className="flex bg-white border rounded-md p-1">
                {emojis.map((emoji, index) => (
                  <button 
                    key={index} 
                    className={`px-2 text-xl ${emoji === selectedEmoji ? 'bg-blue-100 rounded' : ''}`}
                    onClick={() => setSelectedEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <input 
              type="color" 
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
            />
            {gradientMode && (
              <input 
                type="color" 
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
              />
            )}
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={gradientMode}
                onChange={() => setGradientMode(!gradientMode)}
                className="mr-1"
              />
              Gradient
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="whitespace-nowrap">Thickness: {thickness}px</label>
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={thickness}
              onChange={(e) => setThickness(parseInt(e.target.value))}
              className="w-24"
            />
          </div>
          
          <div className="flex items-center space-x-2 ml-auto">
            <button 
              className="p-2 bg-gray-200 rounded"
              onClick={undo}
              disabled={history.length === 0}
            >
              Undo
            </button>
            <button 
              className="p-2 bg-gray-200 rounded"
              onClick={clearCanvas}
            >
              <Trash size={20} />
            </button>
            <button 
              className="p-2 bg-blue-500 text-white rounded"
              onClick={saveCanvas}
            >
              <Save size={20} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseOut={endDrawing}
          onClick={placeEmoji}
          className="w-full h-full bg-white cursor-crosshair"
        />
      </div>
    </div>
  );
}
