import { Folder as FolderLucide } from 'lucide-react';
import { Folder } from '@/types/desktop';
import { useState, useRef, useEffect } from 'react';

interface FolderIconProps {
  folder: Folder;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export const FolderIcon = ({
  folder,
  onDoubleClick,
  onContextMenu,
  onDragStart,
  onDragEnd,
}: FolderIconProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout>();

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

  return (
    <div
      className={`absolute desktop-icon cursor-pointer select-none ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      style={{
        left: `${folder.position.x}px`,
        top: `${folder.position.y}px`,
      }}
      onClick={handleClick}
      onContextMenu={onContextMenu}
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        onDragStart(e);
      }}
      onDragEnd={(e) => {
        setIsDragging(false);
        onDragEnd(e);
      }}
    >
      <div className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/20 dark:hover:bg-black/20 transition-colors">
        <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-primary to-accent rounded-2xl shadow-md">
          <FolderLucide className="w-8 h-8 text-white" />
        </div>
        <span className="text-sm font-medium text-foreground text-center max-w-[80px] truncate bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded backdrop-blur-sm">
          {folder.name}
        </span>
      </div>
    </div>
  );
};
