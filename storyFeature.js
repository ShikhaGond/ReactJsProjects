import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MAX_WIDTH = 1080;
const MAX_HEIGHT = 1920;
const EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in ms
const STORY_DURATION = 5000; // 5 seconds per story

const StoriesFeature = () => {
  const [stories, setStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const fileInputRef = useRef(null);
  const touchStartXRef = useRef(0);
  const progressTimerRef = useRef(null);
  const storyTimerRef = useRef(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    loadStories();
  }, []);

  useEffect(() => {
    if (isModalOpen && stories.length > 0) {
      startStoryProgress();
    }
    return () => {
      clearInterval(progressTimerRef.current);
      clearTimeout(storyTimerRef.current);
    };
  }, [isModalOpen, currentIndex, isPaused]);

  const startStoryProgress = () => {
    setProgress(0);
    clearInterval(progressTimerRef.current);
    clearTimeout(storyTimerRef.current);

    if (!isPaused) {
      const progressInterval = 100; // Update progress every 100ms
      const steps = STORY_DURATION / progressInterval;
      let currentProgress = 0;

      progressTimerRef.current = setInterval(() => {
        currentProgress += (100 / steps);
        setProgress(Math.min(currentProgress, 100));
      }, progressInterval);

      storyTimerRef.current = setTimeout(() => {
        if (currentIndex < stories.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setProgress(0);
        } else {
          setIsModalOpen(false);
          setProgress(0);
        }
      }, STORY_DURATION);
    }
  };

  const loadStories = () => {
    setIsLoading(true);
    setError(null);
    try {
      const stored = localStorage.getItem('stories');
      let loadedStories = [];
      if (stored) {
        loadedStories = JSON.parse(stored);
      }
      // Filter out expired stories
      const now = Date.now();
      loadedStories = loadedStories.filter(story => (now - story.timestamp) < EXPIRY);
      localStorage.setItem('stories', JSON.stringify(loadedStories));
      setStories(loadedStories);
    } catch (e) {
      setError('Failed to load stories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resizeImage = (dataUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = function() {
        try {
          let { width, height } = img;
          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
            width = width * ratio;
            height = height * ratio;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(resizedDataUrl);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const resizedDataUrl = await resizeImage(evt.target.result);
          const newStory = {
            id: Date.now(),
            image: resizedDataUrl,
            timestamp: Date.now()
          };
          const updatedStories = [...stories, newStory];
          setStories(updatedStories);
          localStorage.setItem('stories', JSON.stringify(updatedStories));
        } catch (error) {
          setError('Failed to process image. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read image file. Please try again.');
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
    e.target.value = '';
  };

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const distance = touchEndX - touchStartXRef.current;

    if (Math.abs(distance) >= minSwipeDistance) {
      if (distance < 0 && currentIndex < stories.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (distance > 0 && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    }
    setIsPaused(false);
  };

  return (
    <div className="p-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stories container */}
      <div className="flex items-center overflow-x-auto pb-4 mb-5 border-b border-gray-200 scrollbar-hide">
        <div 
          className={`flex-none w-20 h-20 rounded-full mr-3 bg-gray-100 flex items-center justify-center text-2xl 
            transition-all duration-200 hover:bg-gray-200 
            ${isLoading ? 'cursor-wait opacity-50' : 'cursor-pointer hover:scale-105'}`}
          onClick={() => !isLoading && fileInputRef.current?.click()}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <Plus size={24} className="text-gray-600" />
          )}
        </div>
        
        {stories.map((story, index) => (
          <div
            key={story.id}
            className={`flex-none w-20 h-20 rounded-full mr-3 cursor-pointer bg-cover bg-center
              transition-all duration-200 hover:scale-105
              ${index === currentIndex && isModalOpen ? 'ring-2 ring-blue-500' : 'ring-2 ring-gray-200'}
              ${isLoading ? 'opacity-50' : ''}`}
            style={{ backgroundImage: `url(${story.image})` }}
            onClick={() => {
              if (!isLoading) {
                setCurrentIndex(index);
                setIsModalOpen(true);
                setProgress(0);
              }
            }}
          />
        ))}
        
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50">
          <div className="relative max-w-[90%] max-h-[90vh]">
            {/* Progress bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            <button
              className="absolute -top-12 right-0 text-white p-2 hover:opacity-80 transition-opacity"
              onClick={() => setIsModalOpen(false)}
            >
              <X size={24} />
            </button>
            
            <img
              src={stories[currentIndex].image}
              alt={`Story ${currentIndex + 1}`}
              className="max-w-full max-h-[80vh] rounded-lg shadow-xl"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            />
            
            {currentIndex > 0 && (
              <button
                className="absolute top-1/2 -translate-y-1/2 -left-12 bg-white/10 hover:bg-white/20 p-3 
                  rounded-full text-white backdrop-blur-sm transition-all duration-200"
                onClick={() => {
                  setCurrentIndex(prev => prev - 1);
                  setProgress(0);
                }}
              >
                <ChevronLeft size={24} />
              </button>
            )}
            
            {currentIndex < stories.length - 1 && (
              <button
                className="absolute top-1/2 -translate-y-1/2 -right-12 bg-white/10 hover:bg-white/20 p-3 
                  rounded-full text-white backdrop-blur-sm transition-all duration-200"
                onClick={() => {
                  setCurrentIndex(prev => prev + 1);
                  setProgress(0);
                }}
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoriesFeature;
