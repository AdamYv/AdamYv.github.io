import React, { useState, useRef, useEffect } from 'react';

interface WindowProps {
  id: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  children: React.ReactNode;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onFocus: (id: string) => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
}

export const Window: React.FC<WindowProps> = ({
  id,
  title,
  position,
  size,
  zIndex,
  children,
  onClose,
  onMinimize,
  onFocus,
  onPositionChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onFocus(id);
    setIsDragging(true);
    
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleWindowClick = () => {
    onFocus(id);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newPosition = {
        x: Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(window.innerHeight - size.height - 48, e.clientY - dragOffset.y)),
      };
      
      onPositionChange(id, newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, id, onPositionChange, size]);

  return (
    <div
      ref={windowRef}
      className="window"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex,
      }}
      onClick={handleWindowClick}
    >
      <div className="window-title" onMouseDown={handleMouseDown}>
        <span>{title}</span>
        <div className="window-controls">
          <button
            className="window-control minimize"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize(id);
            }}
          >
            −
          </button>
          <button
            className="window-control maximize"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement maximize
            }}
          >
            □
          </button>
          <button
            className="window-control close"
            onClick={(e) => {
              e.stopPropagation();
              onClose(id);
            }}
          >
            ×
          </button>
        </div>
      </div>
      <div className="window-content" style={{ height: 'calc(100% - 40px)', overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
};