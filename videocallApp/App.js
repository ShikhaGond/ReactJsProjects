// App.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import VideoGrid from './components/VideoGrid';
import Controls from './components/Controls';
import ScreenShare from './components/ScreenShare';
import Filters from './components/Filters';

function App() {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [roomId, setRoomId] = useState('');
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  // Initialize video when component mounts
  useEffect(() => {
    if (isInCall) {
      initializeLocalVideo();
    }
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isInCall]);

  // Simulate participants joining
  useEffect(() => {
    if (isInCall) {
      // Mock participants for demo
      const mockParticipants = [
        { id: 'user1', name: 'Alex Smith', video: true, audio: true },
        { id: 'user2', name: 'Jordan Lee', video: true, audio: false },
      ];
      setParticipants(mockParticipants);
    } else {
      setParticipants([]);
    }
  }, [isInCall]);

  const initializeLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoOn,
        audio: isMicOn
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      localStreamRef.current = stream;
      
      // Add local user to participants
      setParticipants(prevParticipants => [
        ...prevParticipants,
        { id: 'local', name: 'You', video: isVideoOn, audio: isMicOn, isLocal: true }
      ]);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !isMicOn;
      });
    }
    setIsMicOn(!isMicOn);
    updateLocalParticipant({ audio: !isMicOn });
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoOn;
      });
    }
    setIsVideoOn(!isVideoOn);
    updateLocalParticipant({ video: !isVideoOn });
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        
        // Replace the video track
        if (localStreamRef.current && localVideoRef.current) {
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = localStreamRef.current.getVideoTracks()[0];
          // In a real app, you would replace the track in the RTCPeerConnection
          localVideoRef.current.srcObject = screenStream;
        }
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          // Restore camera video
          if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
        };
        
        setIsScreenSharing(true);
      } catch (error) {
        console.error('Error sharing screen:', error);
        setIsScreenSharing(false);
      }
    } else {
      // Stop screen sharing
      setIsScreenSharing(false);
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    }
  };

  const applyFilter = (filter) => {
    setActiveFilter(filter);
    // In a real app, you would apply CSS filters to the video element
  };

  const updateLocalParticipant = (changes) => {
    setParticipants(prevParticipants => 
      prevParticipants.map(p => p.isLocal ? { ...p, ...changes } : p)
    );
  };

  const startCall = () => {
    if (roomId.trim()) {
      setIsInCall(true);
    }
  };

  const endCall = () => {
    setIsInCall(false);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsScreenSharing(false);
    setActiveFilter(null);
  };

  return (
    <div className="app-container">
      {!isInCall ? (
        <div className="join-call-container">
          <h1>Video Call App</h1>
          <input
            type="text"
            placeholder="Enter room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="room-input"
          />
          <button onClick={startCall} className="start-call-btn">
            Join Call
          </button>
        </div>
      ) : (
        <>
          <VideoGrid 
            participants={participants} 
            localVideoRef={localVideoRef}
            activeFilter={activeFilter}
            isScreenSharing={isScreenSharing}
          />
          <Controls 
            toggleMic={toggleMic} 
            toggleVideo={toggleVideo} 
            toggleScreenShare={toggleScreenShare}
            endCall={endCall}
            isMicOn={isMicOn}
            isVideoOn={isVideoOn}
            isScreenSharing={isScreenSharing}
          />
          <Filters 
            applyFilter={applyFilter} 
            activeFilter={activeFilter} 
          />
        </>
      )}
    </div>
  );
}

export default App;