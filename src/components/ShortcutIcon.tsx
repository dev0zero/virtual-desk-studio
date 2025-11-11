import { Link, ExternalLink } from 'lucide-react';
import { Shortcut } from '@/types/desktop';
import { useState, useRef, useEffect } from 'react';

interface ShortcutIconProps {
  shortcut: Shortcut;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onDrag: (e: React.DragEvent) => void;
  onDragEnd: (position: { x: number; y: number }) => void;
}

export const ShortcutIcon = ({
  shortcut,
  onDoubleClick,
  onContextMenu,
  onDrag,
  onDragEnd,
}: ShortcutIconProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(shortcut.position);
  const iconRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setPosition(shortcut.position);
  }, [shortcut.position]);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    const rect = iconRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('type', 'shortcut');
    e.dataTransfer.setData('id', shortcut.id);
    e.dataTransfer.setData('source', 'desktop');
  };

  const handleDrag = (e: React.DragEvent) => {
    if (e.clientX === 0 && e.clientY === 0) return;
    const newX = e.clientX - dragOffsetRef.current.x;
    const newY = e.clientY - dragOffsetRef.current.y;
    setPosition({ x: Math.max(0, newX), y: Math.max(0, newY) });
    onDrag(e);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    if (e.clientX === 0 && e.clientY === 0) return;
    const finalX = e.clientX - dragOffsetRef.current.x;
    const finalY = e.clientY - dragOffsetRef.current.y;
    const finalPosition = { x: Math.max(0, finalX), y: Math.max(0, finalY) };
    setPosition(finalPosition);
    onDragEnd(finalPosition);
  };

  const isExternal = shortcut.url.startsWith('http://') || shortcut.url.startsWith('https://');

  return (
    <div
      ref={iconRef}
      className="absolute flex flex-col items-center gap-1 cursor-pointer select-none group transition-opacity"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        opacity: isDragging ? 0.5 : 1,
      }}
      draggable
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      <div className="relative w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
        {isExternal ? (
          <ExternalLink className="w-8 h-8 text-white" />
        ) : (
          <Link className="w-8 h-8 text-white" />
        )}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        </div>
      </div>
      <span className="text-xs text-center text-foreground max-w-[80px] truncate px-1 py-0.5 rounded bg-background/80 shadow-sm">
        {shortcut.name}
      </span>
    </div>
  );
};
