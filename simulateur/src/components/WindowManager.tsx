import React, { useRef, useEffect } from 'react';
import { useWindows } from '../contexts/WindowContext';
import Window from './Window';

const WindowManager: React.FC = () => {
  const { windows } = useWindows();

  return (
    <>
      {windows.map((window) => (
        <Window key={window.id} windowData={window} />
      ))}
    </>
  );
};

export default WindowManager;