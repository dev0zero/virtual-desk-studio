import { X, Minus, Maximize2 } from 'lucide-react';
import { WindowState, Folder, FileItem } from '@/types/desktop';
import { useState, useRef, useEffect } from 'react';
import { FolderContent } from './FolderContent';

interface WindowProps {
  window: WindowState;
  folder: Folder;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
  onCreateSubfolder: (parentId: string, name: string) => void;
  onUploadFile: (file: FileItem) => void;
  onOpenSubfolder: (subfolder: Folder) => void;
  onSubfolderContextMenu: (e: React.MouseEvent, folderId: string, subfolderId: string) => void;
  onSortContents: () => void;
  onDropFolder: (sourceFolderId: string) => void;
  onUpdateSubfolderPosition: (folderId: string, subfolderId: string, position: { x: number; y: number }) => void;
  onUpdateFilePosition: (folderId: string, fileId: string, position: { x: number; y: number }) => void;
  onCreateTextFile: (folderId: string, fileName: string, position: { x: number; y: number }) => void;
  onDeleteFile: (folderId: string, fileId: string) => void;
  onRenameFile: (folderId: string, fileId: string, newName: string) => void;
  onDeleteSubfolder: (parentId: string, subfolderId: string) => void;
  onRenameSubfolder: (parentId: string, subfolderId: string, newName: string) => void;
  onDropFileToWindow: (fileId: string, sourceFolderId: string) => void;
  onDropSubfolderToWindow: (subfolderId: string, sourceFolderId: string) => void;
}

export const Window = ({
  window,
  folder,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onMove,
  onResize,
  onCreateSubfolder,
  onUploadFile,
  onOpenSubfolder,
  onSubfolderContextMenu,
  onSortContents,
  onDropFolder,
  onUpdateSubfolderPosition,
  onUpdateFilePosition,
  onCreateTextFile,
  onDeleteFile,
  onRenameFile,
  onDeleteSubfolder,
  onRenameSubfolder,
  onDropFileToWindow,
  onDropSubfolderToWindow,
}: WindowProps) => {
  const [isResizing, setIsResizing] = useState(false);
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

  if (window.isMinimized) {
    // Window hidden but still tracked for Dock
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
        className="h-12 bg-gradient-to-r from-primary to-accent flex items-center justify-between px-4 cursor-move"
        onMouseDown={handleMouseDown}
      >
        <span className="text-white font-semibold">{window.title}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onMinimize}
            className="window-button w-6 h-6 rounded-full bg-yellow-400 hover:bg-yellow-500 flex items-center justify-center transition-colors"
          >
            <Minus className="w-2 h-2 text-yellow-900" />
          </button>
          <button
            onClick={onMaximize}
            className="window-button w-6 h-6 rounded-full bg-green-400 hover:bg-green-500 flex items-center justify-center transition-colors"
          >
            <Maximize2 className="w-2 h-2 text-green-900" />
          </button>
          <button
            onClick={onClose}
            className="window-button w-6 h-6 rounded-full bg-red-400 hover:bg-red-500 flex items-center justify-center transition-colors"
          >
            <X className="w-2 h-2 text-red-900" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className="h-[calc(100%-3rem)] overflow-hidden bg-white/50 dark:bg-gray-900/50"
        onDragOver={(e) => {
          // Check if dragging a folder, file, or subfolder
          if (e.dataTransfer.types.includes('source') || e.dataTransfer.types.includes('folderid')) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
          }
        }}
        onDrop={(e) => {
          const source = e.dataTransfer.getData('source');
          const itemId = e.dataTransfer.getData('folderId') || e.dataTransfer.getData('fileId');
          const sourceFolderId = e.dataTransfer.getData('sourceFolderId');
          
          if (source === 'window-subfolder' && itemId) {
            e.preventDefault();
            if (sourceFolderId && sourceFolderId !== folder.id) {
              onDropSubfolderToWindow(itemId, sourceFolderId);
            } else {
              onDropFolder(itemId);
            }
          } else if (source === 'window-file' && itemId && sourceFolderId) {
            e.preventDefault();
            if (sourceFolderId !== folder.id) {
              onDropFileToWindow(itemId, sourceFolderId);
            }
          }
        }}
      >
        <FolderContent
          folder={folder}
          onCreateSubfolder={(name) => onCreateSubfolder(folder.id, name)}
          onOpenSubfolder={onOpenSubfolder}
          onSubfolderContextMenu={(e, subfolderId) =>
            onSubfolderContextMenu(e, folder.id, subfolderId)
          }
          onUploadFile={onUploadFile}
          onSort={onSortContents}
          onUpdateSubfolderPosition={(subfolderId, position) =>
            onUpdateSubfolderPosition(folder.id, subfolderId, position)
          }
          onUpdateFilePosition={(fileId, position) =>
            onUpdateFilePosition(folder.id, fileId, position)
          }
          onCreateTextFile={(fileName, position) =>
            onCreateTextFile(folder.id, fileName, position)
          }
          onDeleteFile={(fileId) => onDeleteFile(folder.id, fileId)}
          onRenameFile={(fileId, newName) => onRenameFile(folder.id, fileId, newName)}
          onDeleteSubfolder={(subfolderId) => onDeleteSubfolder(folder.id, subfolderId)}
          onRenameSubfolder={(subfolderId, newName) =>
            onRenameSubfolder(folder.id, subfolderId, newName)
          }
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
