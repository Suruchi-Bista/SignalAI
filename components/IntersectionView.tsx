import React from 'react';
import type { SignalOptimization, TrafficAnalysis } from '../types';
import { CarIcon, PedestrianIcon } from './icons/Icons';

interface IntersectionViewProps {
  imageUrl: string;
  optimization: SignalOptimization | null;
  analysis: TrafficAnalysis | null;
}

const TrafficLight: React.FC<{ color: 'red' | 'green' | 'amber' }> = ({ color }) => {
  return (
    <div className="w-4 h-4 rounded-full border-2 border-white/50 shadow-lg transition-colors" style={{ backgroundColor: color === 'green' ? '#3ECF8E' : color === 'red' ? '#D62828' : '#FFB703', boxShadow: `0 0 12px 2px ${color === 'green' ? '#3ECF8E' : color === 'red' ? '#D62828' : '#FFB703'}` }}></div>
  );
};


export const IntersectionView: React.FC<IntersectionViewProps> = ({ imageUrl, optimization, analysis }) => {
  const nsIsGreen = optimization ? optimization.phaseNorthSouthGreen > optimization.phaseEastWestGreen : false;
  
  const renderInfoOverlay = () => {
    if (!analysis) return null;
    return (
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white p-3 rounded-lg text-xs md:text-sm font-mono space-y-2 animate-fade-in">
           <div className="flex items-center space-x-2">
                <CarIcon className="w-5 h-5 text-signal-green"/>
                <span>Vehicles: {analysis.vehicleCount}</span>
           </div>
           <div className="flex items-center space-x-2">
                <PedestrianIcon className="w-5 h-5 text-signal-amber"/>
                <span>Pedestrians: {analysis.pedestrianAssessment.count}</span>
           </div>
           {analysis.emergencyVehicle !== 'None' && (
                <div className="flex items-center space-x-2 text-signal-red animate-pulse">
                    <span className="font-bold">!</span>
                    <span>{analysis.emergencyVehicle} Detected</span>
                </div>
           )}
        </div>
    );
  };
  
  const renderSignalOverlay = (direction: 'NS' | 'EW') => {
    if (!optimization) return null;
    const isGreen = direction === 'NS' ? nsIsGreen : !nsIsGreen;
    const time = direction === 'NS' ? optimization.phaseNorthSouthGreen : optimization.phaseEastWestGreen;

    const positionClasses = {
        'NS': 'top-1/2 -translate-y-1/2 left-2 flex-col',
        'EW': 'left-1/2 -translate-x-1/2 top-2 flex-row'
    }

    return (
      <div className={`absolute ${positionClasses[direction]} bg-black/60 backdrop-blur-sm p-2 rounded-lg flex gap-2 items-center justify-center shadow-2xl animate-fade-in`}>
         <div className="flex flex-col gap-1 bg-black/50 p-1 rounded">
            <TrafficLight color={!isGreen ? 'red' : 'amber'} />
            <TrafficLight color={isGreen ? 'green' : 'amber'} />
        </div>
        <div className="text-center">
            <p className="text-white font-bold text-lg font-mono">{time}s</p>
            <p className="text-xs text-signal-white/70">{direction === 'NS' ? 'N-S' : 'E-W'}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full relative overflow-hidden rounded-lg bg-black">
      <img src={imageUrl} alt="Traffic Intersection" className="w-full h-full object-contain" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none"></div>
      {renderInfoOverlay()}
      {renderSignalOverlay('NS')}
      {renderSignalOverlay('EW')}
    </div>
  );
};
