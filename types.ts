export interface VehicleComposition {
  cars: number;
  buses: number;
  motorcycles: number;
  bicycles: number;
}

export interface PedestrianAssessment {
  count: number;
  safetyConcerns: string[];
}

export interface TrafficAnalysis {
  vehicleCount: number;
  vehicleComposition: VehicleComposition;
  pedestrianAssessment: PedestrianAssessment;
  congestionPoints: string[];
  flowEfficiency: number;
  emergencyVehicle: string;
}

export interface SignalOptimization {
  phaseNorthSouthGreen: number;
  phaseEastWestGreen: number;
  pedestrianCrossingTime: number;

  emergencyPriority: boolean;
  expectedWaitTimeReduction: number;
  riskFactors: string[];
  confidenceScore: number;
  reasoning: string;
}

export interface AnalysisHistoryEntry {
  timestamp: string;
  imageUrl: string;
  analysis: TrafficAnalysis;
  optimization: SignalOptimization;
}

export type InputMode = 'image' | 'video';

export type AppState = 'idle' | 'ready' | 'analyzing' | 'optimizing' | 'complete' | 'error';
