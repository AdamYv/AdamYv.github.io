import React, { useRef, useEffect, useState } from 'react';
import { useWindows, WindowData } from '../contexts/WindowContext';

interface WindowProps {
  windowData: WindowData;
}

const Window: React.FC<WindowProps> = ({ windowData }) => {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindow } = useWindows();
  const windowRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !windowData.isMaximized) {
        const newX = e.clientX - dragOffset.x;
        const newY = Math.max(32, e.clientY - dragOffset.y); // Don't go above top bar
        
        updateWindow(windowData.id, { x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, windowData.id, windowData.isMaximized, updateWindow]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (headerRef.current?.contains(e.target as Node)) {
      setIsDragging(true);
      const rect = windowRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    }
    focusWindow(windowData.id);
  };

  const handleClose = () => {
    closeWindow(windowData.id);
  };

  const handleMinimize = () => {
    minimizeWindow(windowData.id);
  };

  const handleMaximize = () => {
    maximizeWindow(windowData.id);
  };

  if (windowData.isMinimized) {
    return null;
  }

  const windowStyle: React.CSSProperties = {
    left: windowData.x,
    top: windowData.y,
    width: windowData.width,
    height: windowData.height,
    zIndex: windowData.zIndex,
  };

  return (
    <div
      ref={windowRef}
      className={`window ${windowData.isMaximized ? 'maximized' : ''}`}
      style={windowStyle}
      onMouseDown={handleMouseDown}
    >
      <div ref={headerRef} className="window-header">
        <div className="window-controls">
          <div
            className="window-control close"
            onClick={handleClose}
            title="Fermer"
          />
          <div
            className="window-control minimize"
            onClick={handleMinimize}
            title="Réduire"
          />
          <div
            className="window-control maximize"
            onClick={handleMaximize}
            title={windowData.isMaximized ? 'Restaurer' : 'Agrandir'}
          />
        </div>
        <div className="window-title">{windowData.title}</div>
      </div>
      <div className="window-content">
        {windowData.component}
      </div>
    </div>
  );
};

export default Window;