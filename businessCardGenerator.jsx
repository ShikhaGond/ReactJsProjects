import { useState } from 'react';

export default function BusinessCardGenerator() {
  const [cardInfo, setCardInfo] = useState({
    name: 'John Doe',
    title: 'Software Developer',
    company: 'Tech Solutions Inc.',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    website: 'www.johndoe.com',
    address: '123 Business Ave, Suite 101, New York, NY 10001',
    bgColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#4a90e2'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCardInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 max-w-6xl mx-auto">
      <div className="w-full md:w-1/2 p-4 bg-gray-50 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Business Card Generator</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input 
              type="text" 
              name="name" 
              value={cardInfo.name} 
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input 
              type="text" 
              name="title" 
              value={cardInfo.title} 
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Company</label>
            <input 
              type="text" 
              name="company" 
              value={cardInfo.company} 
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input 
                type="email" 
                name="email" 
                value={cardInfo.email} 
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input 
                type="text" 
                name="phone" 
                value={cardInfo.phone} 
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Website</label>
            <input 
              type="text" 
              name="website" 
              value={cardInfo.website} 
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input 
              type="text" 
              name="address" 
              value={cardInfo.address} 
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Background Color</label>
              <div className="flex items-center">
                <input 
                  type="color" 
                  name="bgColor" 
                  value={cardInfo.bgColor} 
                  onChange={handleChange}
                  className="w-12 h-8 border rounded mr-2"
                />
                <input 
                  type="text" 
                  name="bgColor" 
                  value={cardInfo.bgColor} 
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Text Color</label>
              <div className="flex items-center">
                <input 
                  type="color" 
                  name="textColor" 
                  value={cardInfo.textColor} 
                  onChange={handleChange}
                  className="w-12 h-8 border rounded mr-2"
                />
                <input 
                  type="text" 
                  name="textColor" 
                  value={cardInfo.textColor} 
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Accent Color</label>
              <div className="flex items-center">
                <input 
                  type="color" 
                  name="accentColor" 
                  value={cardInfo.accentColor} 
                  onChange={handleChange}
                  className="w-12 h-8 border rounded mr-2"
                />
                <input 
                  type="text" 
                  name="accentColor" 
                  value={cardInfo.accentColor} 
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <div className="w-full md:w-1/2 p-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Preview</h2>
          <div className="relative">
            {/* Business Card Preview */}
            <div 
              className="aspect-[7/4] rounded-lg shadow-lg overflow-hidden"
              style={{ backgroundColor: cardInfo.bgColor }}
            >
              <div className="w-full h-full p-6" style={{ color: cardInfo.textColor }}>
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{cardInfo.name}</h1>
                    <p className="text-lg" style={{ color: cardInfo.accentColor }}>{cardInfo.title}</p>
                    <p className="font-bold mt-1">{cardInfo.company}</p>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex flex-col space-y-1 text-sm">
                      <p>{cardInfo.email}</p>
                      <p>{cardInfo.phone}</p>
                      <p>{cardInfo.website}</p>
                      <p className="text-xs mt-1">{cardInfo.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Export Button */}
            <div className="mt-4 flex justify-center">
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                onClick={() => alert('In a real application, this would generate a downloadable image or PDF of your business card.')}
              >
                Export Card
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}