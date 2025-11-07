
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-signal-gray/30 p-4 shadow-md">
      <div className="container mx-auto flex items-center space-x-3">
         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-signal-green to-signal-teal"></div>
         <div>
            <h1 className="text-xl md:text-2xl font-bold font-headings text-signal-white tracking-wide">SignalAI</h1>
            <p className="text-xs md:text-sm text-signal-white/70">Smart Signals. Smarter City.</p>
         </div>
      </div>
    </header>
  );
};
