import React, { useState, useRef, useEffect } from 'react';
import { IconPosition } from './Desktop';

interface DraggableIconProps {
  id: string;
  label: string;
  icon: string;
  position: IconPosition;
  onPositionChange: (id: string, position: IconPosition) => void;
  onDoubleClick: (id: string) => void;
}

export const DraggableIcon: React.FC<DraggableIconProps> = ({
  id,
  label,
  icon,
  position,
  onPositionChange,
  onDoubleClick,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const iconRef = useRef<HTMLDivElement>(null);
  const lastClickTime = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSelected(true);
    setIsDragging(true);
    
    const rect = iconRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleClick = () => {
    const now = Date.now();
    if (now - lastClickTime.current < 300) {
      // Double click
      onDoubleClick(id);
    }
    lastClickTime.current = now;
    setIsSelected(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newPosition = {
        x: Math.max(0, Math.min(window.innerWidth - 80, e.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(window.innerHeight - 130, e.clientY - dragOffset.y)),
      };
      
      onPositionChange(id, newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (iconRef.current && !iconRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDragging, dragOffset, id, onPositionChange]);

  return (
    <div
      ref={iconRef}
      className={`desktop-icon ${isSelected ? 'selected' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div className="icon-image text-4xl">{icon}</div>
      <div className="icon-label">{label}</div>
    </div>
  );
};