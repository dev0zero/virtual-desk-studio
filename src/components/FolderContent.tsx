import { Folder as FolderIcon, File } from 'lucide-react';
import { Folder, FileItem, Position } from '@/types/desktop';
import { useRef, useState, useEffect } from 'react';
import { ContextMenu } from './ContextMenu';

interface FolderContentProps {
  folder: Folder;
  onCreateSubfolder: (name: string) => void;
  onOpenSubfolder: (subfolder: Folder) => void;
  onSubfolderContextMenu: (e: React.MouseEvent, subfolderId: string) => void;
  onUploadFile: (file: FileItem) => void;
  onSort: () => void;
  onUpdateSubfolderPosition: (subfolderId: string, position: Position) => void;
  onUpdateFilePosition: (fileId: string, position: Position) => void;
  onCreateTextFile: (fileName: string, position: Position) => void;
  onDeleteFile: (fileId: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onDeleteSubfolder: (subfolderId: string) => void;
  onRenameSubfolder: (subfolderId: string, newName: string) => void;
}

export const FolderContent = ({
  folder,
  onCreateSubfolder,
  onOpenSubfolder,
  onSubfolderContextMenu,
  onUploadFile,
  onSort,
  onUpdateSubfolderPosition,
  onUpdateFilePosition,
  onCreateTextFile,
  onDeleteFile,
  onRenameFile,
  onDeleteSubfolder,
  onRenameSubfolder,
}: FolderContentProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemType?: 'file' | 'folder'; itemId?: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingItem, setDraggingItem] = useState<{ type: 'folder' | 'file'; id: string; offset: Position } | null>(null);

  const handleCreateFolder = () => {
    const name = prompt('Введите имя новой папки:');
    if (name) {
      onCreateSubfolder(name);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleFileContextMenu = (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, itemType: 'file', itemId: fileId });
  };

  const handleSubfolderContextMenuLocal = (e: React.MouseEvent, subfolderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, itemType: 'folder', itemId: subfolderId });
  };

  const handleCreateTextFile = () => {
    const name = prompt('Введите имя файла (с расширением .txt):');
    if (name) {
      onCreateTextFile(name.endsWith('.txt') ? name : `${name}.txt`, { x: 30, y: 30 });
    }
  };

  const handleDeleteItem = () => {
    if (!contextMenu?.itemId) return;
    if (contextMenu.itemType === 'file') {
      if (confirm('Удалить этот файл?')) {
        onDeleteFile(contextMenu.itemId);
      }
    } else if (contextMenu.itemType === 'folder') {
      if (confirm('Удалить эту папку?')) {
        onDeleteSubfolder(contextMenu.itemId);
      }
    }
  };

  const handleRenameItem = () => {
    if (!contextMenu?.itemId) return;
    if (contextMenu.itemType === 'file') {
      const file = files.find(f => f.id === contextMenu.itemId);
      if (file) {
        const newName = prompt('Введите новое имя файла:', file.name);
        if (newName && newName !== file.name) {
          onRenameFile(contextMenu.itemId, newName);
        }
      }
    } else if (contextMenu.itemType === 'folder') {
      const subfolder = subFolders.find(sf => sf.id === contextMenu.itemId);
      if (subfolder) {
        const newName = prompt('Введите новое имя папки:', subfolder.name);
        if (newName && newName !== subfolder.name) {
          onRenameSubfolder(contextMenu.itemId, newName);
        }
      }
    }
  };

  const handleOpenItem = () => {
    if (!contextMenu?.itemId) return;
    if (contextMenu.itemType === 'folder') {
      const subfolder = subFolders.find(sf => sf.id === contextMenu.itemId);
      if (subfolder) {
        onOpenSubfolder(subfolder);
      }
    }
    // Для файла можно добавить логику открытия в будущем
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      onUploadFile({ id: Date.now().toString(), name: file.name, type: file.type, size: file.size, position: { x: 30, y: 30 } });
    });
  };

  const handleItemMouseDown = (e: React.MouseEvent, type: 'folder' | 'file', id: string, currentPos: Position) => {
    if (e.button !== 0) return; // Only left mouse button
    e.preventDefault();
    e.stopPropagation();
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDraggingItem({
      type,
      id,
      offset: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      },
    });
  };

  // Attach mouse event listeners
  useEffect(() => {
    if (!draggingItem) return;

    const handleMove = (e: MouseEvent) => {
      const container = document.getElementById(`folder-content-${folder.id}`);
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const newX = Math.max(0, Math.min(containerRect.width - 120, e.clientX - containerRect.left - draggingItem.offset.x));
      const newY = Math.max(0, Math.min(containerRect.height - 120, e.clientY - containerRect.top - draggingItem.offset.y));
      
      if (draggingItem.type === 'folder') {
        onUpdateSubfolderPosition(draggingItem.id, { x: newX, y: newY });
      } else {
        onUpdateFilePosition(draggingItem.id, { x: newX, y: newY });
      }
    };

    const handleUp = () => {
      setDraggingItem(null);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [draggingItem, folder.id, onUpdateSubfolderPosition, onUpdateFilePosition]);

  const subFolders = folder.subFolders || [];
  const files = folder.files || [];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/50">
        {/* Заголовок удалён по запросу: без текста под кнопками */}
      </div>

      <div 
        id={`folder-content-${folder.id}`}
        className="flex-1 overflow-hidden relative"
        onContextMenu={handleContextMenu}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        {subFolders.length === 0 && files.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <FolderIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">Папка пуста</p>
            <p className="text-sm">Создайте новую папку, чтобы организовать файлы</p>
          </div>
        ) : (
          <>
            {files.map((file) => (
              <div
                key={file.id}
                className="absolute flex flex-col items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-accent/50 transition-colors cursor-pointer select-none"
                style={{
                  left: `${file.position?.x || 30}px`,
                  top: `${file.position?.y || 30}px`,
                  width: '100px',
                }}
                onMouseDown={(e) => handleItemMouseDown(e, 'file', file.id, file.position || { x: 30, y: 30 })}
                onContextMenu={(e) => handleFileContextMenu(e, file.id)}
              >
                <File className="w-10 h-10 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground text-center max-w-[100px] truncate">{file.name}</span>
              </div>
            ))}
            {subFolders.map((subfolder) => (
              <div
                key={subfolder.id}
                className="absolute flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/20 dark:hover:bg-black/20 transition-colors cursor-pointer select-none"
                style={{
                  left: `${subfolder.position?.x || 30}px`,
                  top: `${subfolder.position?.y || 30}px`,
                  width: '100px',
                }}
                onDoubleClick={() => onOpenSubfolder(subfolder)}
                onContextMenu={(e) => handleSubfolderContextMenuLocal(e, subfolder.id)}
                onMouseDown={(e) => handleItemMouseDown(e, 'folder', subfolder.id, subfolder.position || { x: 30, y: 30 })}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('source', 'window-subfolder');
                  e.dataTransfer.setData('folderId', subfolder.id);
                  const dragImage = new Image();
                  dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                  e.dataTransfer.setDragImage(dragImage, 0, 0);
                  e.dataTransfer.effectAllowed = 'move';
                }}
              >
                <div className="relative w-16 h-16 flex items-center justify-center">
                  {/* Realistic folder icon */}
                  <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-md">
                    <defs>
                      <linearGradient id={`folder-grad-${subfolder.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="1" />
                      </linearGradient>
                    </defs>
                    {/* Folder back */}
                    <path
                      d="M 8 20 L 8 52 C 8 54 9 56 11 56 L 53 56 C 55 56 56 54 56 52 L 56 24 C 56 22 55 20 53 20 Z"
                      fill={`url(#folder-grad-${subfolder.id})`}
                      opacity="0.85"
                    />
                    {/* Folder tab */}
                    <path
                      d="M 8 20 L 8 14 C 8 12 9 10 11 10 L 26 10 L 30 16 L 53 16 C 55 16 56 17 56 19 L 56 20 Z"
                      fill={`url(#folder-grad-${subfolder.id})`}
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
                  {subfolder.name}
                </span>
              </div>
            ))}
          </>
        )}
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/20 border-4 border-dashed border-primary flex items-center justify-center pointer-events-none">
            <p className="text-2xl font-bold text-foreground">Перетащите файлы сюда</p>
          </div>
        )}
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onNew={!contextMenu.itemId ? handleCreateFolder : undefined}
          onNewFile={!contextMenu.itemId ? handleCreateTextFile : undefined}
          onSort={!contextMenu.itemId ? onSort : undefined}
          onOpen={contextMenu.itemId ? handleOpenItem : undefined}
          onDelete={contextMenu.itemId ? handleDeleteItem : undefined}
          onRename={contextMenu.itemId ? handleRenameItem : undefined}
        />
      )}
    </div>
  );
};
