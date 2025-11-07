
import { GoogleGenAI, Type } from "@google/genai";
import type { TrafficAnalysis, SignalOptimization } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        vehicleCount: { type: Type.INTEGER, description: "Total number of vehicles visible." },
        vehicleComposition: {
            type: Type.OBJECT,
            properties: {
                cars: { type: Type.INTEGER },
                buses: { type: Type.INTEGER },
                motorcycles: { type: Type.INTEGER },
                bicycles: { type: Type.INTEGER },
            },
            required: ["cars", "buses", "motorcycles", "bicycles"],
        },
        pedestrianAssessment: {
            type: Type.OBJECT,
            properties: {
                count: { type: Type.INTEGER, description: "Number of pedestrians at crossings." },
                safetyConcerns: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["count", "safetyConcerns"],
        },
        congestionPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of lanes or directions with notable congestion." },
        flowEfficiency: { type: Type.INTEGER, description: "Traffic flow efficiency on a 1-10 scale." },
        emergencyVehicle: { type: Type.STRING, description: "Type of emergency vehicle present (e.g., 'Ambulance', 'None')." },
    },
    required: ["vehicleCount", "vehicleComposition", "pedestrianAssessment", "congestionPoints", "flowEfficiency", "emergencyVehicle"],
};

const optimizationSchema = {
    type: Type.OBJECT,
    properties: {
        phaseNorthSouthGreen: { type: Type.INTEGER, description: "Recommended green light time in seconds for North-South traffic." },
        phaseEastWestGreen: { type: Type.INTEGER, description: "Recommended green light time in seconds for East-West traffic." },
        pedestrianCrossingTime: { type: Type.INTEGER, description: "Recommended time for pedestrian crossing signals." },
        emergencyPriority: { type: Type.BOOLEAN, description: "Is emergency vehicle priority active?" },
        expectedWaitTimeReduction: { type: Type.NUMBER, description: "Predicted percentage reduction in average wait time." },
        riskFactors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Potential risks of this timing plan." },
        confidenceScore: { type: Type.INTEGER, description: "AI's confidence in this recommendation (0-100)." },
        reasoning: { type: Type.STRING, description: "A brief explanation for the recommended timing." },
    },
    required: ["phaseNorthSouthGreen", "phaseEastWestGreen", "pedestrianCrossingTime", "emergencyPriority", "expectedWaitTimeReduction", "riskFactors", "confidenceScore", "reasoning"],
};


export const analyzeTraffic = async (imageFile: File): Promise<TrafficAnalysis> => {
  const imagePart = await fileToGenerativePart(imageFile);
  
  const analysisPrompt = `
    Analyze this traffic intersection image. Assess vehicle counts, types, pedestrian presence, and overall congestion. 
    Identify any emergency vehicles. Output your findings strictly in the provided JSON schema.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, { text: analysisPrompt }] },
    config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
    }
  });

  try {
    const data = JSON.parse(response.text);
    return data as TrafficAnalysis;
  } catch (e) {
    console.error("Failed to parse analysis JSON:", response.text);
    throw new Error("Received malformed analysis data from AI.");
  }
};


export const optimizeSignalTiming = async (analysis: TrafficAnalysis): Promise<SignalOptimization> => {
  const optimizationPrompt = `
    Based on the following real-time traffic analysis, generate an optimal traffic signal timing plan.
    Current intersection state: ${JSON.stringify(analysis, null, 2)}

    Constraints:
    - Total cycle time should be around 90-120 seconds.
    - Minimum pedestrian crossing time is 10 seconds if pedestrians are present.
    - Prioritize emergency vehicles above all else.
    - Optimize for a balance between vehicle throughput and pedestrian safety.
    
    Task:
    Generate the optimal signal phase timing. Consider vehicle queue lengths, pedestrian needs, and any emergency vehicles.
    Avoid creating spillback into adjacent intersections. Ensure fairness across all directions.
    Output your recommendation strictly in the provided JSON schema.
  `;
    
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: optimizationPrompt,
    config: {
        responseMimeType: 'application/json',
        responseSchema: optimizationSchema,
    }
  });
  
  try {
    const data = JSON.parse(response.text);
    return data as SignalOptimization;
  } catch (e) {
    console.error("Failed to parse optimization JSON:", response.text);
    throw new Error("Received malformed optimization data from AI.");
  }
};
