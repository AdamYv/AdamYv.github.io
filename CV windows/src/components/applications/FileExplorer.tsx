import React, { useState } from 'react';

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modified: string;
  icon: string;
}

export const FileExplorer: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('C:\\Users\\Desktop');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const files: FileItem[] = [
    { name: '..', type: 'folder', modified: '', icon: '📁' },
    { name: 'Documents', type: 'folder', modified: '15/12/2024 14:30', icon: '📁' },
    { name: 'Images', type: 'folder', modified: '14/12/2024 09:15', icon: '📁' },
    { name: 'Téléchargements', type: 'folder', modified: '16/12/2024 16:45', icon: '📁' },
    { name: 'CV.sh', type: 'file', size: '2.5 KB', modified: '10/12/2024 11:20', icon: '📄' },
    { name: 'Calculatrice.exe', type: 'file', size: '1.2 MB', modified: '08/12/2024 08:30', icon: '🧮' },
    { name: 'Tetris.exe', type: 'file', size: '856 KB', modified: '12/12/2024 19:45', icon: '🎮' },
    { name: 'README.txt', type: 'file', size: '1.1 KB', modified: '05/12/2024 13:22', icon: '📝' },
    { name: 'photo_profil.jpg', type: 'file', size: '245 KB', modified: '03/12/2024 10:15', icon: '🖼️' },
    { name: 'projet_web.zip', type: 'file', size: '15.7 MB', modified: '01/12/2024 17:30', icon: '📦' },
  ];

  const handleItemClick = (item: FileItem) => {
    setSelectedItem(item.name);
  };

  const handleItemDoubleClick = (item: FileItem) => {
    if (item.type === 'folder') {
      if (item.name === '..') {
        // Go back to parent directory
        const pathParts = currentPath.split('\\');
        pathParts.pop();
        setCurrentPath(pathParts.join('\\') || 'C:\\');
      } else {
        // Enter folder
        setCurrentPath(`${currentPath}\\${item.name}`);
      }
    } else {
      // Open file (simulate)
      alert(`Ouverture de ${item.name}...`);
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Toolbar */}
      <div className="border-b p-2 bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">
            ← Précédent
          </button>
          <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">
            Suivant →
          </button>
          <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">
            ↑ Parent
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Adresse:</span>
          <input 
            type="text" 
            value={currentPath}
            onChange={(e) => setCurrentPath(e.target.value)}
            className="flex-1 px-2 py-1 text-sm border rounded"
          />
        </div>
      </div>

      {/* File list header */}
      <div className="border-b bg-gray-50 px-4 py-2 flex text-sm font-medium text-gray-700">
        <div className="flex-1">Nom</div>
        <div className="w-24">Taille</div>
        <div className="w-32">Type</div>
        <div className="w-40">Date de modification</div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-auto">
        {files.map((file, index) => (
          <div
            key={index}
            className={`flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 ${
              selectedItem === file.name ? 'bg-blue-100' : ''
            }`}
            onClick={() => handleItemClick(file)}
            onDoubleClick={() => handleItemDoubleClick(file)}
          >
            <div className="flex items-center flex-1">
              <span className="mr-2 text-lg">{file.icon}</span>
              <span className="text-sm">{file.name}</span>
            </div>
            <div className="w-24 text-sm text-gray-600">
              {file.size || ''}
            </div>
            <div className="w-32 text-sm text-gray-600">
              {file.type === 'folder' ? 'Dossier' : 'Fichier'}
            </div>
            <div className="w-40 text-sm text-gray-600">
              {file.modified}
            </div>
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div className="border-t bg-gray-50 px-4 py-2 text-sm text-gray-600">
        {files.length} éléments
      </div>
    </div>
  );
};