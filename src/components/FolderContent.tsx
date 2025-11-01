import { Folder as FolderLucide, File } from 'lucide-react';
import { Folder, FileItem } from '@/types/desktop';
import { useRef, useState } from 'react';
import { ContextMenu } from './ContextMenu';

interface FolderContentProps {
  folder: Folder;
  onCreateSubfolder: (name: string) => void;
  onOpenSubfolder: (subfolder: Folder) => void;
  onSubfolderContextMenu: (e: React.MouseEvent, subfolderId: string) => void;
  onUploadFile: (file: FileItem) => void;
  onSort: () => void;
}

export const FolderContent = ({
  folder,
  onCreateSubfolder,
  onOpenSubfolder,
  onSubfolderContextMenu,
  onUploadFile,
  onSort,
}: FolderContentProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      onUploadFile({ id: Date.now().toString(), name: file.name, type: file.type, size: file.size });
    });
  };

  const subFolders = folder.subFolders || [];
  const files = folder.files || [];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/50">
        {/* Заголовок удалён по запросу: без текста под кнопками */}
      </div>

      <div 
        className="flex-1 overflow-auto p-6"
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
            <FolderLucide className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">Папка пуста</p>
            <p className="text-sm">Создайте новую папку, чтобы организовать файлы</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {files.map((file) => (
              <div key={file.id} className="flex flex-col items-center gap-3 p-4 rounded-xl bg-muted/30">
                <File className="w-10 h-10 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground text-center max-w-[100px] truncate">{file.name}</span>
              </div>
            ))}
            {subFolders.map((subfolder) => (
              <button
                key={subfolder.id}
                onDoubleClick={() => onOpenSubfolder(subfolder)}
                onContextMenu={(e) => onSubfolderContextMenu(e, subfolder.id)}
                className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-accent/50 transition-colors group cursor-pointer"
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
                <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-primary to-accent rounded-2xl shadow-md group-hover:scale-105 transition-transform">
                  <FolderLucide className="w-10 h-10 text-white" />
                </div>
                <span className="text-sm font-medium text-foreground text-center max-w-[100px] truncate">
                  {subfolder.name}
                </span>
              </button>
            ))}
          </div>
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
          onNew={handleCreateFolder}
          onSort={onSort}
        />
      )}
    </div>
  );
};
