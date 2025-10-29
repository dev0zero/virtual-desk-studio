import { X, Minus, Maximize2 } from 'lucide-react';
import { WindowState } from '@/types/desktop';
import { useState, useRef, useEffect } from 'react';

interface WindowProps {
  window: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
}

export const Window = ({ window, onClose, onMinimize, onFocus, onMove }: WindowProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      onMove(Math.max(0, newX), Math.max(0, newY));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, onMove]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-button')) return;
    
    setIsDragging(true);
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
    onFocus();
  };

  if (window.isMinimized) return null;

  return (
    <div
      ref={windowRef}
      className="fixed window-glass rounded-xl shadow-2xl overflow-hidden animate-scale-in"
      style={{
        left: `${window.position.x}px`,
        top: `${window.position.y}px`,
        width: `${window.size.width}px`,
        height: `${window.size.height}px`,
        zIndex: window.zIndex,
      }}
      onMouseDown={onFocus}
    >
      {/* Title Bar */}
      <div
        className="h-12 bg-gradient-to-r from-primary to-accent flex items-center justify-between px-4 cursor-move"
        onMouseDown={handleMouseDown}
      >
        <span className="text-white font-semibold">{window.title}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onMinimize}
            className="window-button w-8 h-8 rounded-full bg-yellow-400 hover:bg-yellow-500 flex items-center justify-center transition-colors"
          >
            <Minus className="w-4 h-4 text-yellow-900" />
          </button>
          <button
            className="window-button w-8 h-8 rounded-full bg-green-400 hover:bg-green-500 flex items-center justify-center transition-colors"
          >
            <Maximize2 className="w-4 h-4 text-green-900" />
          </button>
          <button
            onClick={onClose}
            className="window-button w-8 h-8 rounded-full bg-red-400 hover:bg-red-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-red-900" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 h-[calc(100%-3rem)] overflow-auto bg-white/50 dark:bg-gray-900/50">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium mb-2">Содержимое папки "{window.title}"</p>
          <p className="text-sm">Здесь будут отображаться файлы и подпапки</p>
        </div>
      </div>
    </div>
  );
};
