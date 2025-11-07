
import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { IntersectionView } from './components/IntersectionView';
import { MetricsDashboard } from './components/MetricsDashboard';
import { AiReasoningPanel } from './components/AiReasoningPanel';
import { analyzeTraffic, optimizeSignalTiming } from './services/geminiService';
import type { TrafficAnalysis, SignalOptimization, AppState, InputMode, AnalysisHistoryEntry } from './types';
import { PlaceholderPanel } from './components/PlaceholderPanel';
import { Footer } from './components/Footer';
import { AnalysisHistoryPanel } from './components/AnalysisHistoryPanel';

// A rotating set of stock images to simulate capturing different frames from the video feed.
const SIMULATION_IMAGE_URLS = [
  'https://images.pexels.com/photos/416833/pexels-photo-416833.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/164531/pexels-photo-164531.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/221445/pexels-photo-221445.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/7245339/pexels-photo-7245339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/3785424/pexels-photo-3785424.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
];

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const [inputMode, setInputMode] = useState<InputMode>('image');
  // Use a more reliable, non-live video for the demo to avoid embedding issues.
  const [videoUrl, setVideoUrl] = useState<string>('https://www.youtube.com/watch?v=790924-i-p4');
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  
  const [isAnalyzingLive, setIsAnalyzingLive] = useState<boolean>(false);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryEntry[]>([]);
  
  // FIX: Correctly type the ref for ReactPlayer instance. `InstanceType` is for classes, not functional components.
  const playerRef = useRef<ReactPlayer>(null);
  const analysisIntervalRef = useRef<number | null>(null);
  const currentFrameIndexRef = useRef<number>(0);

  const resetState = useCallback(() => {
    setError(null);
    setImageUrl(null);
    setImageFile(null);
    setAnalysisHistory([]);
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    setIsAnalyzingLive(false);
    setIsVideoReady(false);
    setAppState('idle');
  }, []);

  const handleFileChange = (file: File | null) => {
    if (file) {
      resetState();
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setAppState('ready');
    }
  };

  const handleInputModeChange = (mode: InputMode) => {
    setInputMode(mode);
    resetState();
  };

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);
    resetState();
  };

  const runAnalysisOnImage = async (file: File): Promise<{ analysis: TrafficAnalysis, optimization: SignalOptimization }> => {
    const analysisResult = await analyzeTraffic(file);
    const optimizationResult = await optimizeSignalTiming(analysisResult);
    return { analysis: analysisResult, optimization: optimizationResult };
  };

  const handleAnalyzeClick = async () => {
    if (!imageFile) {
      setError("Please select an image file first.");
      return;
    }
    setAppState('analyzing');
    setError(null);
    setAnalysisHistory([]);
    try {
      const { analysis, optimization } = await runAnalysisOnImage(imageFile);
      const newEntry: AnalysisHistoryEntry = {
        timestamp: new Date().toLocaleTimeString(),
        imageUrl: URL.createObjectURL(imageFile),
        analysis,
        optimization,
      };
      setAnalysisHistory([newEntry]);
      setAppState('complete');
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to get AI insights. ${errorMessage}`);
      setAppState('error');
    }
  };

  const formatTimestamp = (seconds: number): string => {
    const floorSeconds = Math.floor(seconds);
    const min = Math.floor(floorSeconds / 60);
    const sec = floorSeconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const runLiveAnalysisCycle = async () => {
    const frameUrl = SIMULATION_IMAGE_URLS[currentFrameIndexRef.current];
    currentFrameIndexRef.current = (currentFrameIndexRef.current + 1) % SIMULATION_IMAGE_URLS.length;

    try {
      const response = await fetch(frameUrl);
      if (!response.ok) throw new Error(`Failed to fetch frame: ${response.statusText}`);
      
      const blob = await response.blob();
      const capturedFile = new File([blob], "captured-frame.jpg", { type: "image/jpeg" });

      const { analysis, optimization } = await runAnalysisOnImage(capturedFile);
      
      const timestamp = playerRef.current ? formatTimestamp(playerRef.current.getCurrentTime()) : '00:00';
      
      const newEntry: AnalysisHistoryEntry = {
        timestamp,
        imageUrl: URL.createObjectURL(capturedFile),
        analysis,
        optimization,
      };
      
      setAnalysisHistory(prev => [newEntry, ...prev]);
      setError(null); // Clear previous errors on success

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Live analysis failed. ${errorMessage}`);
      setIsAnalyzingLive(false); // Stop analysis on error
    }
  };

  useEffect(() => {
    if (isAnalyzingLive) {
      // Run the first cycle immediately
      runLiveAnalysisCycle();
      analysisIntervalRef.current = window.setInterval(runLiveAnalysisCycle, 4000); // Run every 4 seconds
    } else {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
        analysisIntervalRef.current = null;
      }
    }
    return () => { // Cleanup on component unmount
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [isAnalyzingLive]);

  const handleStartStopLiveAnalysis = () => {
    if (!isVideoReady) {
      setError("Video player is not ready or the URL is invalid.");
      return;
    }
    setIsAnalyzingLive(prev => !prev);
  };
  
  const latestEntry = analysisHistory.length > 0 ? analysisHistory[0] : null;

  const renderMainView = () => {
    if (latestEntry) {
      return (
        <IntersectionView 
          imageUrl={latestEntry.imageUrl} 
          optimization={latestEntry.optimization}
          analysis={latestEntry.analysis}
        />
      );
    }
    if (inputMode === 'video') {
      return (
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
          <ReactPlayer 
            ref={playerRef}
            url={videoUrl}
            playing={isAnalyzingLive} // Video plays when analysis is live
            muted={true}
            controls={true}
            width="100%"
            height="100%"
            onReady={() => {
              setIsVideoReady(true);
              setError(null); // Clear any previous video errors
            }}
            // FIX: The onError callback for ReactPlayer does not receive a SyntheticEvent.
            // Its first argument is an error object, which can be typed as `any`.
            onError={(e: any) => {
              console.error("Video player error:", e);
              setError("Failed to load video. The URL may be invalid, or the video has embedding restrictions.");
              setIsVideoReady(false);
            }}
          />
        </div>
      );
    }
    if (imageUrl) {
      return <IntersectionView imageUrl={imageUrl} optimization={null} analysis={null} />;
    }
    return <PlaceholderPanel />;
  };

  return (
    <div className="min-h-screen bg-signal-navy text-signal-white flex flex-col font-sans">
      <Header />
      <main className="flex-grow p-4 md:p-6 lg:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- LEFT COLUMN --- */}
          <div className="lg:col-span-1 flex flex-col space-y-8">
            <ControlPanel 
              onFileChange={handleFileChange}
              onAnalyzeClick={handleAnalyzeClick}
              onStartStopLiveAnalysis={handleStartStopLiveAnalysis}
              isAnalyzingLive={isAnalyzingLive}
              appState={appState}
              fileName={imageFile?.name}
              inputMode={inputMode}
              onInputModeChange={handleInputModeChange}
              videoUrl={videoUrl}
              onVideoUrlChange={handleVideoUrlChange}
              isVideoReady={isVideoReady}
            />
          </div>

          {/* --- CENTER COLUMN --- */}
          <div className="lg:col-span-1 flex flex-col space-y-8">
            <div className="bg-signal-gray/50 rounded-lg p-4 shadow-lg min-h-[250px] md:min-h-[300px] lg:min-h-[350px] flex items-center justify-center">
              {renderMainView()}
            </div>
            {latestEntry && (
              <>
                <MetricsDashboard 
                  analysis={latestEntry.analysis} 
                  optimization={latestEntry.optimization}
                />
                <AiReasoningPanel reasoning={latestEntry.optimization.reasoning} />
              </>
            )}
            {error && (
              <div className="bg-signal-red/20 border border-signal-red text-signal-white p-4 rounded-lg">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
          </div>
          
          {/* --- RIGHT COLUMN --- */}
          <div className="lg:col-span-1 flex flex-col space-y-8">
              <AnalysisHistoryPanel history={analysisHistory} />
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
