import React from 'react';
import type { TrafficAnalysis, SignalOptimization } from '../types';
import { MetricCard } from './MetricCard';

interface MetricsDashboardProps {
  analysis: TrafficAnalysis | null;
  optimization: SignalOptimization | null;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ analysis, optimization }) => {
  if (!analysis || !optimization) {
    return null;
  }
  
  const { vehicleComposition } = analysis;

  return (
    <div className="bg-signal-gray/50 rounded-lg p-6 shadow-lg animate-fade-in">
      <h2 className="text-2xl font-headings font-bold text-signal-green mb-4">AI Analysis Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <MetricCard title="Wait Time Reduction" value={`${optimization.expectedWaitTimeReduction}%`} isHighlighted />
        <MetricCard title="AI Confidence" value={`${optimization.confidenceScore}%`} isHighlighted />
        <MetricCard title="Total Vehicles" value={analysis.vehicleCount.toString()} />
        <MetricCard title="Pedestrians" value={analysis.pedestrianAssessment.count.toString()} />
        <MetricCard title="Flow Efficiency" value={`${analysis.flowEfficiency}/10`} />
        <MetricCard title="Emergency Vehicle" value={analysis.emergencyVehicle} />
        <MetricCard title="Cars" value={vehicleComposition.cars.toString()} />
        <MetricCard title="Buses" value={vehicleComposition.buses.toString()} />
        <MetricCard title="Bikes" value={vehicleComposition.bicycles.toString()} />
        <MetricCard title="Motorcycles" value={vehicleComposition.motorcycles.toString()} />
      </div>
    </div>
  );
};
