import { useState, useRef, useEffect } from 'react';

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const botResponses = [
    "I understand your question. Let me think about that...",
    "That's an interesting topic. Here's what I know about it.",
    "Thanks for sharing that information with me.",
    "I'm not sure I understand. Could you please rephrase your question?",
    "Based on my knowledge, I can provide you with some insights on this topic.",
    "That's a great question! Here's what I can tell you.",
    "I'm here to help with any questions you might have.",
    "Let me process that information and get back to you with a thoughtful response."
  ];
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };
  
  const simulateBotThinking = () => {
    return new Promise((resolve) => {
      const thinkingTime = Math.floor(Math.random() * 2000) + 1000;
      setTimeout(resolve, thinkingTime);
    });
  };
  
const generateBotResponse = async (userMessage) => {
    setIsTyping(true);
    try {
      const response = await fetch('your-backend-api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error fetching response:', error);
      return "Sorry, I'm having trouble connecting right now.";
    }
  };
    // For demo purposes, we'll use random responses
    const lowercaseMessage = userMessage.toLowerCase();{
    
    if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi')) {
      return "Hello there! It's nice to meet you. How can I assist you today?";
    } else if (lowercaseMessage.includes('name')) {
      return "I'm an AI assistant created to help answer your questions.";
    } else if (lowercaseMessage.includes('help')) {
      return "I'm here to help! You can ask me questions, request information, or just chat. What's on your mind?";
    } else if (lowercaseMessage.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    } else if (lowercaseMessage.includes('weather')) {
      return "I don't have real-time weather data, but I'd be happy to discuss weather patterns or climate in general!";
    } else if (lowercaseMessage.includes('joke')) {
      return "Why don't scientists trust atoms? Because they make up everything!";
    } else {
      return botResponses[Math.floor(Math.random() * botResponses.length)];
    }
  };
};
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (input.trim() === '') return;
    
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    setIsTyping(true);
    
    await simulateBotThinking();
    
    const botMessage = {
      id: messages.length + 2,
      text: generateBotResponse(input),
      sender: 'bot'
    };
    
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };
  
  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto shadow-lg rounded-lg">
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center">
        <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
        <h1 className="text-xl font-semibold">AI Assistant</h1>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${
                message.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-white text-gray-800 rounded-lg px-4 py-2 border border-gray-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );

export default ChatBot;