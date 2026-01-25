import React, { useState } from 'react';

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  icon: string;
  size?: string;
  modified?: string;
}

interface FinderProps {
  initialPath?: string;
}

const Finder: React.FC<FinderProps> = ({ initialPath = '/' }) => {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const fileSystem: Record<string, FileItem[]> = {
    '/': [
      { name: 'Applications', type: 'folder', icon: '📱' },
      { name: 'Documents', type: 'folder', icon: '📂' },
      { name: 'Desktop', type: 'folder', icon: '🖥️' },
      { name: 'Downloads', type: 'folder', icon: '⬇️' },
      { name: 'Pictures', type: 'folder', icon: '🖼️' },
      { name: 'Music', type: 'folder', icon: '🎵' },
      { name: 'Movies', type: 'folder', icon: '🎬' },
    ],
    '/Documents': [
      { name: 'CV.sh', type: 'file', icon: '📄', size: '2.3 KB', modified: '10 déc. 2025' },
      { name: 'Projects', type: 'folder', icon: '📁' },
      { name: 'Finance', type: 'folder', icon: '💰' },
      { name: 'Research.pdf', type: 'file', icon: '📊', size: '1.2 MB', modified: '8 déc. 2025' },
    ],
    '/Documents/Projects': [
      { name: 'Options_Pricer_Tool.cs', type: 'file', icon: '💻', size: '45.2 KB', modified: '5 déc. 2025' },
      { name: 'Trading_Backtester_App.cs', type: 'file', icon: '📈', size: '67.8 KB', modified: '3 déc. 2025' },
      { name: 'PINN_Financial_System_Model.py', type: 'file', icon: '🧠', size: '23.4 KB', modified: '1 déc. 2025' },
      { name: 'Hierarchical_Clustering_Asset.py', type: 'file', icon: '🔬', size: '18.9 KB', modified: '28 nov. 2025' },
    ],
    '/Documents/Finance': [
      { name: 'Market_Analysis.xlsx', type: 'file', icon: '📊', size: '892 KB', modified: '9 déc. 2025' },
      { name: 'Portfolio_Data.csv', type: 'file', icon: '📋', size: '156 KB', modified: '7 déc. 2025' },
      { name: 'Risk_Models', type: 'folder', icon: '⚠️' },
    ],
    '/Applications': [
      { name: 'Options Pricer.app', type: 'file', icon: '📊', size: '2.1 MB', modified: '10 déc. 2025' },
      { name: 'Tetris.app', type: 'file', icon: '🎮', size: '1.8 MB', modified: '10 déc. 2025' },
      { name: 'Portfolio Manager.app', type: 'file', icon: '💼', size: '3.2 MB', modified: '10 déc. 2025' },
      { name: 'Market Data.app', type: 'file', icon: '📈', size: '2.7 MB', modified: '10 déc. 2025' },
      { name: 'Terminal.app', type: 'file', icon: '⚡', size: '1.2 MB', modified: '10 déc. 2025' },
    ],
  };

  const currentFiles = fileSystem[currentPath] || [];

  const handleItemClick = (item: FileItem) => {
    setSelectedItem(item.name);
  };

  const handleItemDoubleClick = (item: FileItem) => {
    if (item.type === 'folder') {
      const newPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
      setCurrentPath(newPath);
      setSelectedItem(null);
    } else {
      // Handle file opening
      if (item.name === 'CV.sh') {
        alert('🥊 Easter Egg MMA: "Precision beats power, timing beats speed!" - Conor McGregor');
      } else {
        alert(`Ouverture de ${item.name}`);
      }
    }
  };

  const handleBackClick = () => {
    if (currentPath !== '/') {
      const pathParts = currentPath.split('/');
      pathParts.pop();
      const newPath = pathParts.join('/') || '/';
      setCurrentPath(newPath);
      setSelectedItem(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-md">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-white/10">
        <button
          onClick={handleBackClick}
          disabled={currentPath === '/'}
          className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ←
        </button>
        <div className="flex-1 px-3 py-1 bg-white/10 rounded text-sm">
          {currentPath}
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 gap-1">
          {currentFiles.map((item) => (
            <div
              key={item.name}
              className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                selectedItem === item.name
                  ? 'bg-blue-500/30 border border-blue-400/50'
                  : 'hover:bg-white/10'
              }`}
              onClick={() => handleItemClick(item)}
              onDoubleClick={() => handleItemDoubleClick(item)}
            >
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <div className="text-sm font-medium">{item.name}</div>
                {item.size && (
                  <div className="text-xs text-white/60">
                    {item.size} • {item.modified}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {currentFiles.length === 0 && (
          <div className="text-center text-white/60 mt-8">
            Ce dossier est vide
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="p-2 border-t border-white/10 text-xs text-white/60">
        {currentFiles.length} élément{currentFiles.length !== 1 ? 's' : ''}
        {selectedItem && ` • ${selectedItem} sélectionné`}
      </div>
    </div>
  );
};

export default Finder;