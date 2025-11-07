import React from 'react';
import { ImageIcon } from './icons/Icons';

export const PlaceholderPanel: React.FC = () => {
    return (
        <div className="text-center text-signal-white/50 p-8 border-2 border-dashed border-signal-gray rounded-xl">
            <ImageIcon className="mx-auto mb-4" />
            <h3 className="text-xl font-bold font-headings">SignalAI Visualization</h3>
            <p>Upload a traffic image or enter a live feed URL to see the AI in action.</p>
        </div>
    );
};