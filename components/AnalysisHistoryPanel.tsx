import React from 'react';
import type { AnalysisHistoryEntry } from '../types';
import { CarIcon, PedestrianIcon } from './icons/Icons';

interface HistoryItemProps {
  entry: AnalysisHistoryEntry;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ entry }) => {
  const { timestamp, imageUrl, analysis, optimization } = entry;
  
  return (
    <div className="bg-signal-gray/30 p-3 rounded-lg flex space-x-4">
      <div className="flex-shrink-0 w-24 h-16">
        <img src={imageUrl} alt={`Traffic at ${timestamp}`} className="w-full h-full object-cover rounded-md" />
        <p className="text-xs text-center text-signal-white/50 mt-1">{timestamp}</p>
      </div>
      <div className="flex-grow">
        <div className="flex justify-between text-sm">
          <div className="flex items-center space-x-1.5">
            <CarIcon className="w-4 h-4 text-signal-green" />
            <span className="font-mono">{analysis.vehicleCount}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <PedestrianIcon className="w-4 h-4 text-signal-amber" />
            <span className="font-mono">{analysis.pedestrianAssessment.count}</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-signal-white/80 space-y-1">
            <p>N-S Green: <span className="font-mono font-bold text-signal-green">{optimization.phaseNorthSouthGreen}s</span></p>
            <p>E-W Green: <span className="font-mono font-bold text-signal-green">{optimization.phaseEastWestGreen}s</span></p>
        </div>
      </div>
    </div>
  );
};

interface AnalysisHistoryPanelProps {
  history: AnalysisHistoryEntry[];
}

export const AnalysisHistoryPanel: React.FC<AnalysisHistoryPanelProps> = ({ history }) => {
  return (
    <div className="bg-signal-gray/50 rounded-lg p-6 shadow-lg h-full flex flex-col">
      <h2 className="text-2xl font-headings font-bold text-signal-green mb-4 flex-shrink-0">Analysis History</h2>
      {history.length === 0 ? (
        <div className="flex-grow flex items-center justify-center text-center text-signal-white/50">
          <p>Analysis history will appear here.</p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-2">
            {history.map((entry, index) => (
                <HistoryItem key={`${entry.timestamp}-${index}`} entry={entry} />
            ))}
        </div>
      )}
    </div>
  );
};
