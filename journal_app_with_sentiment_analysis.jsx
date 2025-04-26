// Personal Journal App with Sentiment Analysis
// This application that allows users to create journal entries and analyzes the sentiment of each entry

import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, BarChart, Calendar, Smile, Meh, Frown } from 'lucide-react';

// Simple sentiment analysis function using a dictionary approach
const analyzeSentiment = (text) => {
  const positiveWords = ['happy', 'joy', 'excited', 'wonderful', 'love', 'great', 'good', 'excellent', 'amazing', 'fantastic', 'beautiful', 'grateful', 'thankful', 'appreciate', 'enjoy', 'success', 'accomplished', 'proud'];
  
  const negativeWords = ['sad', 'angry', 'upset', 'terrible', 'hate', 'bad', 'awful', 'horrible', 'disappointed', 'frustrated', 'annoyed', 'stress', 'worried', 'anxious', 'regret', 'failed', 'exhausted', 'miserable'];
  
  const words = text.toLowerCase().split(/\s+/);
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    const cleanWord = word.replace(/[.,!?;:'"()-]/g, '');
    if (positiveWords.includes(cleanWord)) positiveCount++;
    if (negativeWords.includes(cleanWord)) negativeCount++;
  });
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
};

// Helper function to get today's date in YYYY-MM-DD format
const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const JournalApp = () => {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getToday());
  const [activeTab, setActiveTab] = useState('write');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEntryId, setEditingEntryId] = useState(null);
  
  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);
  
  // Save entries to localStorage whenever the entries state changes
  useEffect(() => {
    localStorage.setItem('journalEntries', JSON.stringify(entries));
  }, [entries]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentEntry.trim() === '') return;
    
    const sentiment = analyzeSentiment(currentEntry);
    
    if (editingEntryId !== null) {
      // Update existing entry
      const updatedEntries = entries.map(entry => 
        entry.id === editingEntryId ? 
        { ...entry, title, content: currentEntry, date, sentiment, lastEdited: new Date().toISOString() } : 
        entry
      );
      setEntries(updatedEntries);
      setEditingEntryId(null);
    } else {
      // Create new entry
      const newEntry = {
        id: Date.now(),
        title: title || `Journal Entry ${entries.length + 1}`,
        content: currentEntry,
        date,
        sentiment,
        createdAt: new Date().toISOString(),
        lastEdited: new Date().toISOString()
      };
      setEntries([newEntry, ...entries]);
    }
    
    // Reset form
    setCurrentEntry('');
    setTitle('');
    setDate(getToday());
  };
  
  const handleEdit = (entry) => {
    setCurrentEntry(entry.content);
    setTitle(entry.title);
    setDate(entry.date);
    setEditingEntryId(entry.id);
    setActiveTab('write');
  };
  
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setEntries(entries.filter(entry => entry.id !== id));
      if (editingEntryId === id) {
        setEditingEntryId(null);
        setCurrentEntry('');
        setTitle('');
        setDate(getToday());
      }
    }
  };
  
  const filteredEntries = entries.filter(entry => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      entry.title.toLowerCase().includes(lowerCaseQuery) ||
      entry.content.toLowerCase().includes(lowerCaseQuery)
    );
  });
  
  // Calculate sentiment statistics
  const sentimentStats = entries.reduce((stats, entry) => {
    stats[entry.sentiment] = (stats[entry.sentiment] || 0) + 1;
    return stats;
  }, { positive: 0, neutral: 0, negative: 0 });
  
  const totalEntries = entries.length;
  
  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive': return <Smile className="text-green-500" />;
      case 'negative': return <Frown className="text-red-500" />;
      default: return <Meh className="text-yellow-500" />;
    }
  };
  
  const renderTab = () => {
    switch (activeTab) {
      case 'write':
        return (
          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your entry"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Journal Entry</label>
                <textarea
                  value={currentEntry}
                  onChange={(e) => setCurrentEntry(e.target.value)}
                  placeholder="How are you feeling today?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center"
              >
                <PlusCircle className="mr-2" size={18} />
                {editingEntryId !== null ? 'Update Entry' : 'Save Entry'}
              </button>
            </form>
          </div>
        );
        
      case 'entries':
        return (
          <div className="p-4">
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search your entries..."
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>
            
            {filteredEntries.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No entries found
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEntries.map(entry => (
                  <div key={entry.id} className="border border-gray-200 rounded-md p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{entry.title}</h3>
                      <div className="flex items-center">
                        {getSentimentIcon(entry.sentiment)}
                        <span className="ml-2 text-xs text-gray-500">{entry.date}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3 line-clamp-3">{entry.content}</p>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'stats':
        return (
          <div className="p-4">
            <h2 className="font-medium text-lg mb-4">Sentiment Analysis</h2>
            
            <div className="bg-white shadow rounded-lg p-4 mb-6">
              <div className="text-center mb-2">
                <div className="text-xl font-bold">{totalEntries}</div>
                <div className="text-gray-500 text-sm">Total Entries</div>
              </div>
              
              <div className="flex justify-around mt-4">
                <div className="text-center">
                  <div className="flex justify-center">
                    <Smile className="text-green-500" size={24} />
                  </div>
                  <div className="text-lg font-semibold">{sentimentStats.positive}</div>
                  <div className="text-gray-500 text-xs">Positive</div>
                </div>
                
                <div className="text-center">
                  <div className="flex justify-center">
                    <Meh className="text-yellow-500" size={24} />
                  </div>
                  <div className="text-lg font-semibold">{sentimentStats.neutral}</div>
                  <div className="text-gray-500 text-xs">Neutral</div>
                </div>
                
                <div className="text-center">
                  <div className="flex justify-center">
                    <Frown className="text-red-500" size={24} />
                  </div>
                  <div className="text-lg font-semibold">{sentimentStats.negative}</div>
                  <div className="text-gray-500 text-xs">Negative</div>
                </div>
              </div>
            </div>
            
            {totalEntries > 0 && (
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="font-medium mb-2">Sentiment Distribution</h3>
                <div className="h-6 w-full bg-gray-200 rounded-full overflow-hidden">
                  {totalEntries > 0 && (
                    <>
                      <div 
                        className="h-full bg-green-500 float-left" 
                        style={{ width: `${(sentimentStats.positive / totalEntries) * 100}%` }}
                      />
                      <div 
                        className="h-full bg-yellow-500 float-left" 
                        style={{ width: `${(sentimentStats.neutral / totalEntries) * 100}%` }}
                      />
                      <div 
                        className="h-full bg-red-500 float-left" 
                        style={{ width: `${(sentimentStats.negative / totalEntries) * 100}%` }}
                      />
                    </>
                  )}
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-green-500">Positive</span>
                  <span className="text-yellow-500">Neutral</span>
                  <span className="text-red-500">Negative</span>
                </div>
              </div>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-4">
        <h1 className="text-white text-xl font-bold">Reflective Journal</h1>
        <p className="text-blue-100 text-sm">Track your mood and thoughts</p>
      </div>
      
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('write')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center ${
            activeTab === 'write' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          <PlusCircle size={16} className="mr-1" />
          Write
        </button>
        
        <button
          onClick={() => setActiveTab('entries')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center ${
            activeTab === 'entries' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          <Calendar size={16} className="mr-1" />
          Entries
        </button>
        
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center ${
            activeTab === 'stats' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          <BarChart size={16} className="mr-1" />
          Stats
        </button>
      </div>
      
      {renderTab()}
    </div>
  );
};

export default JournalApp;