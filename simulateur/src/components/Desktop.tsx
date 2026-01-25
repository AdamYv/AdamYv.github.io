import React, { useState, useEffect } from 'react';
import TopBar from './TopBar';
import Dock from './Dock';
import DesktopIcons from './DesktopIcons';

const Desktop: React.FC = () => {
  return (
    <div className="desktop">
      <TopBar />
      <DesktopIcons />
      <Dock />
    </div>
  );
};

export default Desktop;