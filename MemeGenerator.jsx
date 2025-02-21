import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Upload } from 'lucide-react';

const DraggableText = ({ text, position, onPositionChange, style, bounds }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const elementRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setStartPos({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      let newX = e.clientX - startPos.x;
      let newY = e.clientY - startPos.y;

      // Bounds 
      if (bounds) {
        newX = Math.max(0, Math.min(newX, bounds.width - (elementRef.current?.offsetWidth || 0)));
        newY = Math.max(0, Math.min(newY, bounds.height - (elementRef.current?.offsetHeight || 0)));
      }

      onPositionChange({ x: newX, y: newY });
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];

      let newX = touch.clientX - startPos.x;
      let newY = touch.clientY - startPos.y;

      if (bounds) {
        newX = Math.max(0, Math.min(newX, bounds.width - (elementRef.current?.offsetWidth || 0)));
        newY = Math.max(0, Math.min(newY, bounds.height - (elementRef.current?.offsetHeight || 0)));
      }

      onPositionChange({ x: newX, y: newY });
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, startPos, bounds, onPositionChange]);

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        ...style
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {text}
    </div>
  );
};

const MemeGenerator = () => {
  const [memeTexts, setMemeTexts] = useState([
    { id: 'top', text: '', x: 0, y: 0, fontSize: 40, color: '#FFFFFF' },
    { id: 'bottom', text: '', x: 0, y: 0, fontSize: 40, color: '#FFFFFF' }
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [customImage, setCustomImage] = useState(null);
  const [containerBounds, setContainerBounds] = useState({ width: 0, height: 0 });
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);

  const memeTemplates = [
    '/api/placeholder/800/600',
    '/api/placeholder/800/600',
    '/api/placeholder/800/600',
    '/api/placeholder/800/600',
    '/api/placeholder/800/600',
    '/api/placeholder/800/600'
  ];

  useEffect(() => {
    const updateBounds = () => {
      if (containerRef.current) {
        setContainerBounds({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  const handleTextChange = (id, field, value) => {
    setMemeTexts(prev => 
      prev.map(text => 
        text.id === id ? { ...text, [field]: value } : text
      )
    );
  };

  const handlePositionChange = (id, position) => {
    setMemeTexts(prev =>
      prev.map(text =>
        text.id === id ? { ...text, x: position.x, y: position.y } : text
      )
    );
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Meme Generator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             
              <div className="space-y-4">
                <div 
                  ref={containerRef}
                  className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden"
                >
                  <img 
                    src={customImage || memeTemplates[selectedTemplate]} 
                    alt="meme template" 
                    className="w-full h-full object-contain"
                  />
                  
                  
                  {memeTexts.map((textItem) => (
                    <DraggableText
                      key={textItem.id}
                      text={
                        <h2 className="text-center break-words shadow-text">
                          {textItem.text}
                        </h2>
                      }
                      position={{ x: textItem.x, y: textItem.y }}
                      onPositionChange={(pos) => handlePositionChange(textItem.id, pos)}
                      bounds={containerBounds}
                      style={{
                        fontSize: `${textItem.fontSize}px`,
                        color: textItem.color,
                        maxWidth: '80vw',
                        wordWrap: 'break-word'
                      }}
                    />
                  ))}
                </div>

               
                <div className="flex gap-4">
                  <Button 
                    onClick={() => fileInputRef.current.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Upload Image
                  </Button>
                  {customImage && (
                    <Button 
                      variant="outline"
                      onClick={() => setCustomImage(null)}
                    >
                      Clear Upload
                    </Button>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

           
              <div className="space-y-6">
                
                {memeTexts.map((textItem) => (
                  <div key={textItem.id} className="space-y-4">
                    <div>
                      <Label htmlFor={`${textItem.id}-text`}>
                        {textItem.id.charAt(0).toUpperCase() + textItem.id.slice(1)} Text
                      </Label>
                      <Input
                        id={`${textItem.id}-text`}
                        value={textItem.text}
                        onChange={(e) => handleTextChange(textItem.id, 'text', e.target.value)}
                        placeholder={`Enter ${textItem.id} text`}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Font Size ({textItem.fontSize}px)</Label>
                      <Slider
                        value={[textItem.fontSize]}
                        onValueChange={([value]) => handleTextChange(textItem.id, 'fontSize', value)}
                        min={20}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`${textItem.id}-color`}>Text Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="color"
                          id={`${textItem.id}-color`}
                          value={textItem.color}
                          onChange={(e) => handleTextChange(textItem.id, 'color', e.target.value)}
                          className="w-20 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={textItem.color}
                          onChange={(e) => handleTextChange(textItem.id, 'color', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                
                {!customImage && (
                  <div>
                    <Label className="block mb-2">Select Template</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {memeTemplates.map((template, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedTemplate(index)}
                          className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                            selectedTemplate === index ? 'border-blue-500 scale-95' : 'border-transparent hover:border-blue-300'
                          }`}
                        >
                          <img 
                            src={template} 
                            alt={`template ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full mt-6"
                  onClick={() => {
                    alert('Meme generated! In a real app, this would save or share the meme.');
                  }}
                >
                  Generate Meme
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <style jsx>{`
          .shadow-text {
            text-shadow: 2px 2px 0 #000,
                        -2px -2px 0 #000,
                        2px -2px 0 #000,
                        -2px 2px 0 #000;
          }
        `}</style>
      </div>
    </div>
  );
};

export default MemeGenerator;
