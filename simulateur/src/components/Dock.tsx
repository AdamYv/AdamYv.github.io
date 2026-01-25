import React from 'react';
import { useWindows } from '../contexts/WindowContext';

const Dock: React.FC = () => {
  const { windows, openWindow, minimizeWindow } = useWindows();

  const dockApps = [
    {
      id: 'finder',
      icon: '📁',
      name: 'Finder',
      component: () => import('./apps/Finder'),
    },
    {
      id: 'terminal',
      icon: '⚡',
      name: 'Terminal',
      component: () => import('./apps/Terminal'),
    },
    {
      id: 'options-pricer',
      icon: '📊',
      name: 'Options Pricer',
      component: () => import('./apps/OptionsPricer'),
    },
    {
      id: 'tetris',
      icon: '🎮',
      name: 'Tetris',
      component: () => import('./apps/Tetris'),
    },
    {
      id: 'portfolio',
      icon: '💼',
      name: 'Portfolio Manager',
      component: () => import('./apps/PortfolioManager'),
    },
    {
      id: 'market-data',
      icon: '📈',
      name: 'Market Data',
      component: () => import('./apps/MarketData'),
    },
  ];

  const handleAppClick = async (app: any) => {
    // Check if app is already open
    const existingWindow = windows.find(w => w.title === app.name);
    
    if (existingWindow) {
      // If minimized, restore it
      if (existingWindow.isMinimized) {
        minimizeWindow(existingWindow.id);
      }
      return;
    }

    // Dynamically import and open the app
    try {
      const AppComponent = await app.component();
      openWindow({
        title: app.name,
        component: <AppComponent.default />,
        x: Math.random() * 200 + 100,
        y: Math.random() * 200 + 100,
        width: 800,
        height: 600,
        isMinimized: false,
        isMaximized: false,
      });
    } catch (error) {
      console.error(`Failed to load ${app.name}:`, error);
    }
  };

  const isAppOpen = (appName: string) => {
    return windows.some(w => w.title === appName && !w.isMinimized);
  };

  return (
    <div className="dock">
      {dockApps.map((app) => (
        <div
          key={app.id}
          className={`dock-item ${isAppOpen(app.name) ? 'active' : ''}`}
          onClick={() => handleAppClick(app)}
          title={app.name}
        >
          {app.icon}
        </div>
      ))}
    </div>
  );
};

export default Dock;