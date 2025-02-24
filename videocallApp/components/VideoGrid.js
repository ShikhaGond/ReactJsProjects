// components/VideoGrid.js
import React from 'react';

const VideoGrid = ({ participants, localVideoRef, activeFilter, isScreenSharing }) => {
  const getFilterStyle = (filter) => {
    switch(filter) {
        case 'blur':
        return { filter: 'blur(4px)' };
        case 'grayscale':
        return { filter: 'grayscale(100%)' };
        case 'sepia':
        return { filter: 'sepia(100%)' };
        case 'invert':
        return { filter: 'invert(100%)' };
        default:
        return {};
    }
};

return (
    <div className={`video-grid ${participants.length > 2 ? 'grid-layout' : 'flex-layout'}`}>{participants.map(participant => (
        <div key={participant.id}className={`video-container ${participant.isLocal ? 'local-video' : ''} ${!participant.video ? 'video-off' : ''}`}
        >{participant.isLocal ? (
            <video ref={localVideoRef}autoPlay muted playsInline style={activeFilter && !isScreenSharing ? getFilterStyle(activeFilter) : {}}className="video-element"
            />
        ) : (
            <video autoPlay playsInline className="video-element"
            />
            )}
    
    <div className="participant-info">
            <span className="participant-name">{participant.name}</span>
            {!participant.audio && (
            <span className="mic-off-indicator">🔇</span>
            )}
        </div>
        {!participant.video && (
            <div className="video-off-placeholder">
            <span className="avatar-circle">
                {participant.name.charAt(0)}
            </span>
            </div>
        )}
        </div>
    ))}
    </div>
);
};

export default VideoGrid;

// components/Controls.js
import React from 'react';

const Controls = ({ 
    toggleMic, 
    toggleVideo, 
    toggleScreenShare, 
    endCall,
    isMicOn,
    isVideoOn,
    isScreenSharing
}) => {
return (
    <div className="controls-container">
    <button 
        onClick={toggleMic} 
        className={`control-btn ${!isMicOn ? 'control-off' : ''}`}
        title={isMicOn ? "Mute microphone" : "Unmute microphone"}
    >
        {isMicOn ? '🎙️' : '🔇'}
    </button>

    <button 
        onClick={toggleVideo} 
        className={`control-btn ${!isVideoOn ? 'control-off' : ''}`}
        title={isVideoOn ? "Turn off camera" : "Turn on camera"}
    >
        {isVideoOn ? '📹' : '🚫'}
    </button>

    <button 
        onClick={toggleScreenShare} 
        className={`control-btn ${isScreenSharing ? 'active' : ''}`}
        title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
    >
        {isScreenSharing ? '📺' : '🖥️'}
    </button>

    <button 
        onClick={endCall} 
        className="end-call-btn"
        title="End call"
    >
        📞
    </button>
    </div>
);
};

export default Controls;

// components/ScreenShare.js
import React from 'react';

const ScreenShare = ({ isScreenSharing, toggleScreenShare }) => {
return (
    <div className={`screen-share-container ${isScreenSharing ? 'active' : ''}`}>
    <button 
        onClick={toggleScreenShare}
        className="screen-share-btn"
    >
        {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
    </button>
    </div>
);
};

export default ScreenShare;

// components/Filters.js
import React from 'react';

const Filters = ({ applyFilter, activeFilter }) => {
  const filters = [
    { id: null, name: 'None' },
    { id: 'blur', name: 'Blur' },
    { id: 'grayscale', name: 'Grayscale' },
    { id: 'sepia', name: 'Sepia' },
    { id: 'invert', name: 'Invert' }
];

return (
    <div className="filters-container">
    <div className="filters-dropdown">
        <button className="filters-btn">Filters</button>
        <div className="filters-content">
        {filters.map(filter => (
            <button key={filter.id || 'none'} onClick={() => applyFilter(filter.id)}
              className={`filter-option ${activeFilter === filter.id ? 'active' : ''}`}
            > {filter.name}
            </button>
        ))}
        </div>
    </div>
    </div>
);
};

export default Filters;