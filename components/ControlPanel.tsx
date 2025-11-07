import React, { useRef } from 'react';
import ReactPlayer from 'react-player';
import type { AppState, InputMode } from '../types';
import { UploadIcon, ProcessingIcon, PlayIcon, StopIcon } from './icons/Icons';

interface ControlPanelProps {
  onFileChange: (file: File | null) => void;
  onAnalyzeClick: () => void;
  onStartStopLiveAnalysis: () => void;
  isAnalyzingLive: boolean;
  appState: AppState;
  fileName?: string;
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
  videoUrl: string;
  onVideoUrlChange: (url: string) => void;
  isVideoReady: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
    onFileChange, 
    onAnalyzeClick,
    onStartStopLiveAnalysis,
    isAnalyzingLive, 
    appState, 
    fileName,
    inputMode,
    onInputModeChange,
    videoUrl,
    onVideoUrlChange,
    isVideoReady,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileChange(file);
  };
  
  const getStatusMessage = () => {
    if (isAnalyzingLive) return "Live analysis in progress...";
    switch (appState) {
      case 'analyzing':
        return 'Analyzing traffic patterns...';
      case 'optimizing':
        return 'Calculating optimal signal timing...';
      case 'complete':
        return 'Analysis Complete!';
      case 'error':
        return 'An error occurred.';
      default:
        if (inputMode === 'image') return 'Upload a traffic image to begin.';
        if (!ReactPlayer.canPlay(videoUrl)) return 'Please enter a valid video URL.';
        if (!isVideoReady) return 'Video player is loading...';
        return 'Ready for live analysis from the feed.';
    }
  };
  
  const isLoading = appState === 'analyzing' || appState === 'optimizing';

  const renderImageInput = () => (
    <div className="space-y-4 animate-fade-in">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          accept="image/jpeg, image/png, image/webp"
        />
        <button
          onClick={handleFileButtonClick}
          disabled={isLoading || isAnalyzingLive}
          className="w-full flex items-center justify-center space-x-2 bg-signal-teal hover:bg-opacity-80 disabled:bg-signal-gray/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          <UploadIcon />
          <span>{fileName ? 'Change Image' : 'Select Image'}</span>
        </button>
        {fileName && (
            <p className="text-center text-sm text-signal-white/60 truncate">Selected: {fileName}</p>
        )}
    </div>
  );

  const renderVideoInput = () => (
    <div className="space-y-2 animate-fade-in">
        <label htmlFor="video-url" className="text-sm font-medium text-signal-white/80">Live Feed URL</label>
        <input 
            id="video-url"
            type="text"
            value={videoUrl}
            onChange={(e) => onVideoUrlChange(e.target.value)}
            placeholder="e.g., https://www.youtube.com/watch?v=..."
            disabled={isAnalyzingLive}
            className="w-full bg-signal-gray border border-signal-teal/50 rounded-lg p-3 text-white focus:ring-2 focus:ring-signal-green focus:outline-none transition disabled:bg-signal-gray/50"
        />
    </div>
  );

  const renderActionButton = () => {
    if (inputMode === 'image') {
      const isDisabled = isLoading || appState !== 'ready';
      return (
        <button
          onClick={onAnalyzeClick}
          disabled={isDisabled}
          className="w-full bg-signal-green hover:bg-opacity-80 text-signal-navy font-bold py-4 px-4 rounded-lg transition-all duration-200 disabled:bg-signal-gray/50 disabled:text-signal-white/50 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100 flex items-center justify-center space-x-3"
        >
          {isLoading ? (
            <>
              <ProcessingIcon />
              <span>ANALYZING...</span>
            </>
          ) : (
            <span>Analyze Traffic Flow</span>
          )}
        </button>
      );
    }

    if (inputMode === 'video') {
      const isDisabled = !isVideoReady;
      const buttonClass = isAnalyzingLive
        ? "bg-signal-red hover:bg-opacity-80 text-white"
        : "bg-signal-green hover:bg-opacity-80 text-signal-navy";

      return (
        <button
          onClick={onStartStopLiveAnalysis}
          disabled={isDisabled}
          className={`w-full font-bold py-4 px-4 rounded-lg transition-all duration-200 disabled:bg-signal-gray/50 disabled:text-signal-white/50 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100 flex items-center justify-center space-x-3 ${buttonClass}`}
        >
          {isAnalyzingLive ? (
            <>
              <ProcessingIcon />
              <span>STOP LIVE ANALYSIS</span>
            </>
          ) : (
            <>
              <PlayIcon />
              <span>START LIVE ANALYSIS</span>
            </>
          )}
        </button>
      );
    }
    return null;
  };

  return (
    <div className="bg-signal-gray/50 rounded-lg p-6 shadow-lg space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-headings font-bold text-signal-green">Control Center</h2>
        <p className="text-signal-white/70 mt-1">{getStatusMessage()}</p>
      </div>

      <div>
        <div className="flex bg-signal-gray rounded-lg p-1 mb-4">
            <button 
                onClick={() => onInputModeChange('image')}
                disabled={isAnalyzingLive}
                className={`w-1/2 p-2 rounded-md text-sm font-bold transition-colors ${inputMode === 'image' ? 'bg-signal-teal text-white' : 'text-signal-white/60 hover:bg-signal-gray/50'} disabled:cursor-not-allowed disabled:text-signal-white/30`}
            >
                Image Upload
            </button>
            <button 
                onClick={() => onInputModeChange('video')}
                disabled={isAnalyzingLive}
                className={`w-1/2 p-2 rounded-md text-sm font-bold transition-colors ${inputMode === 'video' ? 'bg-signal-teal text-white' : 'text-signal-white/60 hover:bg-signal-gray/50'} disabled:cursor-not-allowed disabled:text-signal-white/30`}
            >
                Live Feed
            </button>
        </div>
        {inputMode === 'image' ? renderImageInput() : renderVideoInput()}
      </div>
      {renderActionButton()}
    </div>
  );
};
