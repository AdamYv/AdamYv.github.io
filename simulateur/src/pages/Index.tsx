import React, { useState, useEffect } from 'react';
import BootScreen from '../components/BootScreen';
import Desktop from '../components/Desktop';
import WindowManager from '../components/WindowManager';
import { WindowProvider } from '../contexts/WindowContext';

const Index = () => {
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    // Boot sequence duration
    const bootTimer = setTimeout(() => {
      setIsBooting(false);
    }, 5000);

    return () => clearTimeout(bootTimer);
  }, []);

  return (
    <WindowProvider>
      <div className="relative w-full h-screen overflow-hidden">
        {isBooting && <BootScreen />}
        <Desktop />
        <WindowManager />
      </div>
    </WindowProvider>
  );
};

export default Index;