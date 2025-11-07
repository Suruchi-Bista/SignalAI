import React from 'react';

interface AiReasoningPanelProps {
  reasoning: string | undefined;
}

export const AiReasoningPanel: React.FC<AiReasoningPanelProps> = ({ reasoning }) => {
  if (!reasoning) {
    return null;
  }
  
  return (
    <div className="bg-signal-gray/50 rounded-lg p-6 shadow-lg animate-fade-in">
      <h3 className="text-xl font-headings font-bold text-signal-amber mb-2">AI Reasoning</h3>
      <p className="text-signal-white/90 text-sm md:text-base leading-relaxed">
        {reasoning}
      </p>
    </div>
  );
};
