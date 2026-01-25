import React from 'react';

const BootScreen: React.FC = () => {
  return (
    <div className="boot-screen">
      <div className="boot-logo">
        🍎 macOS Simulator
      </div>
      <div className="text-white/70 text-lg mb-8 animate-pulse">
        Initializing system...
      </div>
      <div className="boot-progress">
        <div className="boot-progress-bar"></div>
      </div>
      <div className="text-white/50 text-sm mt-4">
        Loading desktop environment
      </div>
    </div>
  );
};

export default BootScreen;