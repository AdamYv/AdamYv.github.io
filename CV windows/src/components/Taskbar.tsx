import React from 'react';
import { WindowState } from './Desktop';

interface TaskbarProps {
  windows: WindowState[];
  onWindowClick: (id: string) => void;
  onStartMenuClick: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  onWindowClick,
  onStartMenuClick,
}) => {
  const currentTime = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="taskbar">
      <button className="start-button" onClick={onStartMenuClick}>
        🪟 Démarrer
      </button>
      
      <div className="flex-1 flex items-center gap-2 ml-4">
        {windows.map(window => (
          <button
            key={window.id}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              window.isMinimized 
                ? 'bg-gray-600 text-gray-300' 
                : 'bg-gray-500 text-white hover:bg-gray-400'
            }`}
            onClick={() => onWindowClick(window.id)}
          >
            {window.title}
          </button>
        ))}
      </div>
      
      <div className="text-white text-sm font-mono">
        {currentTime}
      </div>
    </div>
  );
};