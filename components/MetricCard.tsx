
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  isHighlighted?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, isHighlighted = false }) => {
  return (
    <div className={`rounded-lg p-3 ${isHighlighted ? 'bg-signal-teal' : 'bg-signal-gray/50'} transition-all duration-300 transform hover:scale-105 hover:bg-signal-teal/80`}>
      <p className="text-xs text-signal-white/70 truncate">{title}</p>
      <p className={`font-bold font-mono text-xl ${isHighlighted ? 'text-white' : 'text-signal-green'} truncate`}>{value}</p>
    </div>
  );
};
