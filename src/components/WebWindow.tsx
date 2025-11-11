import { X, Minus, Maximize2, RefreshCw, ArrowLeft } from 'lucide-react';
import { WindowState } from '@/types/desktop';
import { useState, useRef, useEffect } from 'react';

interface WebWindowProps {
  window: WindowState;
  url: string;
  title: string;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
}

export const WebWindow = ({
  window,
  url,
  title,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onMove,
  onResize,
}: WebWindowProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [iframeKey, setIframeKey] = useState(0);
  const windowRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  const handleBack = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.history.back();
      } catch (e) {
        console.warn('Cannot access iframe history');
      }
    }
  };

  if (window.isMinimized) {
    return null;
  }

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
        className="h-9 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-between px-4 cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={handleBack}
            className="window-button w-6 h-6 rounded hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Назад"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={handleRefresh}
            className="window-button w-6 h-6 rounded hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Обновить"
          >
            <RefreshCw className="w-4 h-4 text-white" />
          </button>
          <span className="text-white font-semibold truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onMinimize}
            className="window-button w-6 h-6 rounded-full bg-yellow-400 hover:bg-yellow-500 flex items-center justify-center transition-colors"
          >
            <Minus className="w-4 h-4 text-yellow-900" />
          </button>
          <button
            onClick={onMaximize}
            className="window-button w-6 h-6 rounded-full bg-green-400 hover:bg-green-500 flex items-center justify-center transition-colors"
          >
            <Maximize2 className="w-4 h-4 text-green-900" />
          </button>
          <button
            onClick={onClose}
            className="window-button w-6 h-6 rounded-full bg-red-400 hover:bg-red-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-red-900" />
          </button>
        </div>
      </div>

      {/* Content - iframe */}
      <div className="h-[calc(100%-2.25rem)] overflow-hidden bg-white">
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0"
          title={title}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
      
      {/* Resize handle */}
      {!window.isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsResizing(true);
            const startX = e.clientX;
            const startY = e.clientY;
            const startW = window.size.width;
            const startH = window.size.height;
            
            const handleMouseMove = (me: MouseEvent) => {
              const newW = Math.max(400, startW + (me.clientX - startX));
              const newH = Math.max(300, startH + (me.clientY - startY));
              onResize(newW, newH);
            };
            
            const handleMouseUp = () => {
              setIsResizing(false);
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />
      )}
    </div>
  );
};
