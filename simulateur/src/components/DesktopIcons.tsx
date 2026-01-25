import React from 'react';
import { useWindows } from '../contexts/WindowContext';
import CVTerminal from './apps/CVTerminal';
import Finder from './apps/Finder';

const DesktopIcons: React.FC = () => {
  const { openWindow } = useWindows();

  const desktopIcons = [
    {
      id: 'cv',
      name: 'CV.sh',
      icon: '📄',
      protected: true,
      action: () => {
        openWindow({
          title: 'Terminal - CV Adam Guemoune',
          component: <CVTerminal />,
          x: 100,
          y: 100,
          width: 900,
          height: 700,
          isMinimized: false,
          isMaximized: false,
        });
      },
    },
    {
      id: 'documents',
      name: 'Documents',
      icon: '📂',
      protected: true,
      action: () => {
        openWindow({
          title: 'Documents',
          component: <Finder initialPath="/Documents" />,
          x: 150,
          y: 150,
          width: 800,
          height: 600,
          isMinimized: false,
          isMaximized: false,
        });
      },
    },
    {
      id: 'mma-easter-egg',
      name: 'Fight Stats',
      icon: '🥊',
      protected: false,
      action: () => {
        // Easter egg MMA
        alert('🥊 "Float like a butterfly, sting like a bee!" - Muhammad Ali\n\nEaster Egg: Conor McGregor vs Nate Diaz - "I\'m not surprised, motherf***ers!"');
      },
    },
    {
      id: 'trash',
      name: 'Corbeille',
      icon: '🗑️',
      protected: true,
      action: () => {
        alert('La corbeille est vide');
      },
    },
  ];

  return (
    <div className="desktop-icons">
      {desktopIcons.map((icon) => (
        <div
          key={icon.id}
          className="desktop-icon"
          onDoubleClick={icon.action}
          title={icon.name}
        >
          <div className="desktop-icon-image">
            {icon.icon}
          </div>
          <div className="desktop-icon-label">
            {icon.name}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DesktopIcons;