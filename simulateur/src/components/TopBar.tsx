import React, { useState, useEffect } from 'react';

const TopBar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="top-bar">
      <div className="clock">
        <div className="text-center">
          <div className="font-semibold">{formatTime(currentTime)}</div>
          <div className="text-xs opacity-70">{formatDate(currentTime)}</div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;