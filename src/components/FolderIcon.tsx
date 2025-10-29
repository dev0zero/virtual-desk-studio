import { Folder as FolderLucide } from 'lucide-react';
import { Folder } from '@/types/desktop';
import { useState, useRef, useEffect } from 'react';

interface FolderIconProps {
  folder: Folder;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onDrag: (e: React.DragEvent) => void;
  onDragEnd: (position: { x: number; y: number }) => void;
}

export const FolderIcon = ({
  folder,
  onDoubleClick,
  onContextMenu,
  onDrag,
  onDragEnd,
}: FolderIconProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [tempPosition, setTempPosition] = useState(folder.position);
  const clickTimeoutRef = useRef<NodeJS.Timeout>();
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const handleClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = undefined;
      onDoubleClick();
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        clickTimeoutRef.current = undefined;
      }, 300);
    }
  };

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isDragging) {
      setTempPosition(folder.position);
    }
  }, [folder.position, isDragging]);

  return (
    <div
      className={`absolute desktop-icon cursor-move select-none transition-opacity ${
        isDragging ? 'opacity-70 z-50' : 'opacity-100'
      }`}
      style={{
        left: `${tempPosition.x}px`,
        top: `${tempPosition.y}px`,
        transition: isDragging ? 'none' : 'left 0.1s ease-out, top 0.1s ease-out',
      }}
      onClick={handleClick}
      onContextMenu={onContextMenu}
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        const rect = e.currentTarget.getBoundingClientRect();
        dragOffsetRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        // Создаем невидимый элемент для drag image
        const dragImage = new Image();
        dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(dragImage, 0, 0);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDrag={(e) => {
        if (e.clientX === 0 && e.clientY === 0) return; // Игнорируем последнее событие drag
        
        const newX = Math.max(0, Math.min(e.clientX - dragOffsetRef.current.x, window.innerWidth - 120));
        const newY = Math.max(0, Math.min(e.clientY - dragOffsetRef.current.y, window.innerHeight - 150));
        
        setTempPosition({ x: newX, y: newY });
        onDrag(e);
      }}
      onDragEnd={(e) => {
        setIsDragging(false);
        if (e.clientX === 0 && e.clientY === 0) return;
        
        const newX = Math.max(0, Math.min(e.clientX - dragOffsetRef.current.x, window.innerWidth - 120));
        const newY = Math.max(0, Math.min(e.clientY - dragOffsetRef.current.y, window.innerHeight - 150));
        
        setTempPosition({ x: newX, y: newY });
        onDragEnd({ x: newX, y: newY });
      }}
    >
      <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/20 dark:hover:bg-black/20 transition-colors pointer-events-none">
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Realistic folder icon */}
          <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id={`folder-grad-${folder.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="1" />
              </linearGradient>
            </defs>
            {/* Folder back */}
            <path
              d="M 8 20 L 8 52 C 8 54 9 56 11 56 L 53 56 C 55 56 56 54 56 52 L 56 24 C 56 22 55 20 53 20 Z"
              fill={`url(#folder-grad-${folder.id})`}
              opacity="0.85"
            />
            {/* Folder tab */}
            <path
              d="M 8 20 L 8 14 C 8 12 9 10 11 10 L 26 10 L 30 16 L 53 16 C 55 16 56 17 56 19 L 56 20 Z"
              fill={`url(#folder-grad-${folder.id})`}
            />
            {/* Highlight */}
            <path
              d="M 12 20 L 12 50 C 12 51 12.5 52 13 52 L 51 52 C 51.5 52 52 51 52 50 L 52 24 C 52 23 51.5 22 51 22 L 12 22 Z"
              fill="white"
              opacity="0.15"
            />
          </svg>
        </div>
        <span className="text-sm font-medium text-foreground text-center max-w-[80px] truncate bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded backdrop-blur-sm">
          {folder.name}
        </span>
      </div>
    </div>
  );
};
