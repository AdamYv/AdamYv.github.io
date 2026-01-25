import React, { useState, useCallback } from 'react';
import { DraggableIcon } from './DraggableIcon';
import { Window } from './Window';
import { Taskbar } from './Taskbar';
import { CVTerminal } from './applications/CVTerminal';
import { Calculator } from './applications/Calculator';
import { TetrisGame } from './applications/TetrisGame';
import { FileExplorer } from './applications/FileExplorer';

export interface WindowState {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  isMinimized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export interface IconPosition {
  x: number;
  y: number;
}

export const Desktop: React.FC = () => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [nextZIndex, setNextZIndex] = useState(100);
  const [iconPositions, setIconPositions] = useState<Record<string, IconPosition>>({
    'cv.sh': { x: 50, y: 50 },
    'calculator': { x: 50, y: 150 },
    'tetris': { x: 50, y: 250 },
    'explorer': { x: 50, y: 350 },
  });

  const openWindow = useCallback((id: string, title: string, component: React.ComponentType<any>, size = { width: 600, height: 400 }) => {
    const existingWindow = windows.find(w => w.id === id);
    if (existingWindow) {
      // Bring to front and unminimize
      setWindows(prev => prev.map(w => 
        w.id === id 
          ? { ...w, isMinimized: false, zIndex: nextZIndex }
          : w
      ));
      setNextZIndex(prev => prev + 1);
      return;
    }

    const newWindow: WindowState = {
      id,
      title,
      component,
      isMinimized: false,
      position: { 
        x: Math.max(100, Math.random() * (window.innerWidth - size.width - 100)), 
        y: Math.max(50, Math.random() * (window.innerHeight - size.height - 150))
      },
      size,
      zIndex: nextZIndex,
    };

    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(prev => prev + 1);
  }, [windows, nextZIndex]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, isMinimized: true } : w
    ));
  }, []);

  const bringToFront = useCallback((id: string) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, zIndex: nextZIndex } : w
    ));
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  const updateWindowPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setWindows(prev => prev.map(w => 
      w.id === id ? { ...w, position } : w
    ));
  }, []);

  const updateIconPosition = useCallback((iconId: string, position: IconPosition) => {
    setIconPositions(prev => ({
      ...prev,
      [iconId]: position
    }));
  }, []);

  const handleIconDoubleClick = (iconId: string) => {
    switch (iconId) {
      case 'cv.sh':
        openWindow('cv-terminal', 'CV.sh - Terminal', CVTerminal, { width: 700, height: 500 });
        break;
      case 'calculator':
        openWindow('calculator', 'Calculatrice', Calculator, { width: 320, height: 480 });
        break;
      case 'tetris':
        openWindow('tetris', 'Tetris', TetrisGame, { width: 400, height: 600 });
        break;
      case 'explorer':
        openWindow('explorer', 'Explorateur de fichiers', FileExplorer, { width: 800, height: 600 });
        break;
    }
  };

  const icons = [
    { id: 'cv.sh', label: 'CV.sh', icon: '📄' },
    { id: 'calculator', label: 'Calculatrice', icon: '🧮' },
    { id: 'tetris', label: 'Tetris', icon: '🎮' },
    { id: 'explorer', label: 'Explorateur', icon: '📁' },
  ];

  return (
    <div className="desktop">
      {/* Desktop Icons */}
      {icons.map(icon => (
        <DraggableIcon
          key={icon.id}
          id={icon.id}
          label={icon.label}
          icon={icon.icon}
          position={iconPositions[icon.id]}
          onPositionChange={updateIconPosition}
          onDoubleClick={handleIconDoubleClick}
        />
      ))}

      {/* Windows */}
      {windows.map(window => (
        !window.isMinimized && (
          <Window
            key={window.id}
            id={window.id}
            title={window.title}
            position={window.position}
            size={window.size}
            zIndex={window.zIndex}
            onClose={closeWindow}
            onMinimize={minimizeWindow}
            onFocus={bringToFront}
            onPositionChange={updateWindowPosition}
          >
            <window.component />
          </Window>
        )
      ))}

      {/* Taskbar */}
      <Taskbar 
        windows={windows}
        onWindowClick={(id) => {
          const window = windows.find(w => w.id === id);
          if (window?.isMinimized) {
            setWindows(prev => prev.map(w => 
              w.id === id ? { ...w, isMinimized: false, zIndex: nextZIndex } : w
            ));
            setNextZIndex(prev => prev + 1);
          } else {
            bringToFront(id);
          }
        }}
        onStartMenuClick={() => {
          // TODO: Implement start menu
          console.log('Start menu clicked');
        }}
      />
    </div>
  );
};