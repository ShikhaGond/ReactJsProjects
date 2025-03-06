import React, { useState, useEffect } from 'react';

const ColorPaletteGenerator = () => {
  const [baseColor, setBaseColor] = useState('#4287f5');
  const [paletteType, setPaletteType] = useState('analogous');
  const [palette, setPalette] = useState([]);
  const [numColors, setNumColors] = useState(5);
  const [savedPalettes, setSavedPalettes] = useState([]);

  const hexToHSL = (hex) => {
    hex = hex.replace(/^#/, '');
    
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;
    
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; 
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const hslToHex = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; 
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = x => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const generatePalette = () => {
    const hsl = hexToHSL(baseColor);
    let newPalette = [];
    
    switch (paletteType) {
      case 'analogous':
        for (let i = 0; i < numColors; i++) {
          const newHue = (hsl.h + (i - Math.floor(numColors / 2)) * 30) % 360;
          newPalette.push(hslToHex(newHue < 0 ? 360 + newHue : newHue, hsl.s, hsl.l));
        }
        break;
        
      case 'monochromatic':
        for (let i = 0; i < numColors; i++) {
          const newLightness = Math.max(10, Math.min(90, 30 + (i * 60 / (numColors - 1))));
          newPalette.push(hslToHex(hsl.h, hsl.s, newLightness));
        }
        break;
        
      case 'complementary':
        const complementHue = (hsl.h + 180) % 360;
        if (numColors === 2) {
          newPalette = [baseColor, hslToHex(complementHue, hsl.s, hsl.l)];
        } else {
          for (let i = 0; i < numColors; i++) {
            const ratio = i / (numColors - 1);
            const newHue = Math.round(hsl.h + (complementHue - hsl.h) * ratio);
            newPalette.push(hslToHex(newHue, hsl.s, hsl.l));
          }
        }
        break;
        
      case 'triadic':
        for (let i = 0; i < numColors; i++) {
          const newHue = (hsl.h + (i * 120)) % 360;
          newPalette.push(hslToHex(newHue, hsl.s, hsl.l));
        }
        break;
        
      case 'random':
        for (let i = 0; i < numColors; i++) {
          const randomHue = Math.floor(Math.random() * 360);
          const randomSat = Math.floor(Math.random() * 40) + 60; 
          const randomLight = Math.floor(Math.random() * 60) + 20; 
          newPalette.push(hslToHex(randomHue, randomSat, randomLight));
        }
        break;
        
      default:
        newPalette = [baseColor];
    }
    
    setPalette(newPalette);
  };

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color).then(() => {
      alert(`Copied ${color} to clipboard!`);
    });
  };

  const savePalette = () => {
    setSavedPalettes([...savedPalettes, { 
      id: Date.now(), 
      colors: [...palette], 
      type: paletteType 
    }]);
  };

  const removePalette = (id) => {
    setSavedPalettes(savedPalettes.filter(palette => palette.id !== id));
  };

  useEffect(() => {
    generatePalette();
  }, [baseColor, paletteType, numColors]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Color Palette Generator</h1>
      
      <div className="mb-8 bg-gray-100 p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-medium">Base Color</label>
            <div className="flex items-center">
              <input 
                type="color" 
                value={baseColor} 
                onChange={(e) => setBaseColor(e.target.value)} 
                className="h-10 w-16 cursor-pointer border-0"
              />
              <input 
                type="text" 
                value={baseColor} 
                onChange={(e) => setBaseColor(e.target.value)} 
                className="ml-2 p-2 border rounded"
              />
            </div>
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Palette Type</label>
            <select 
              value={paletteType} 
              onChange={(e) => setPaletteType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="analogous">Analogous</option>
              <option value="monochromatic">Monochromatic</option>
              <option value="complementary">Complementary</option>
              <option value="triadic">Triadic</option>
              <option value="random">Random</option>
            </select>
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Number of Colors</label>
            <input 
              type="range" 
              min="2" 
              max="9" 
              value={numColors} 
              onChange={(e) => setNumColors(parseInt(e.target.value))}
              className="w-full"
            />
            <span className="block text-center">{numColors}</span>
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={generatePalette} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Regenerate
            </button>
            
            <button 
              onClick={savePalette} 
              className="px-4 py-2 ml-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save Palette
            </button>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Current Palette</h2>
        <div className="flex overflow-x-auto pb-2">
          {palette.map((color, index) => (
            <div key={index} className="flex-shrink-0 mr-2 mb-2 text-center">
              <div 
                className="h-24 w-24 rounded cursor-pointer shadow-md hover:shadow-lg transition-shadow"
                style={{ backgroundColor: color }}
                onClick={() => copyToClipboard(color)}
                title="Click to copy"
              ></div>
              <div className="mt-1">{color}</div>
            </div>
          ))}
        </div>
      </div>
      
      {savedPalettes.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Saved Palettes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedPalettes.map((savedPalette) => (
              <div key={savedPalette.id} className="bg-gray-100 p-4 rounded-lg shadow">
                <div className="flex justify-between mb-2">
                  <span className="font-medium capitalize">{savedPalette.type} Palette</span>
                  <button 
                    onClick={() => removePalette(savedPalette.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex overflow-x-auto pb-2">
                  {savedPalette.colors.map((color, colorIndex) => (
                    <div 
                      key={colorIndex} 
                      className="h-12 grow rounded-sm mr-1 cursor-pointer"
                      style={{ backgroundColor: color }}
                      onClick={() => copyToClipboard(color)}
                      title={`${color} - Click to copy`}
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPaletteGenerator;
