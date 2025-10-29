import { Folder as FolderLucide, Plus } from 'lucide-react';
import { Folder } from '@/types/desktop';
import { Button } from './ui/button';

interface FolderContentProps {
  folder: Folder;
  onCreateSubfolder: (name: string) => void;
  onOpenSubfolder: (subfolder: Folder) => void;
  onSubfolderContextMenu: (e: React.MouseEvent, subfolderId: string) => void;
}

export const FolderContent = ({
  folder,
  onCreateSubfolder,
  onOpenSubfolder,
  onSubfolderContextMenu,
}: FolderContentProps) => {
  const handleCreateFolder = () => {
    const name = prompt('Введите имя новой папки:');
    if (name) {
      onCreateSubfolder(name);
    }
  };

  const subFolders = folder.subFolders || [];

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/50">
        <h2 className="font-semibold text-foreground">Содержимое папки</h2>
        <Button
          onClick={handleCreateFolder}
          size="sm"
          variant="outline"
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Создать папку
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {subFolders.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <FolderLucide className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">Папка пуста</p>
            <p className="text-sm">Создайте новую папку, чтобы организовать файлы</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {subFolders.map((subfolder) => (
              <button
                key={subfolder.id}
                onDoubleClick={() => onOpenSubfolder(subfolder)}
                onContextMenu={(e) => onSubfolderContextMenu(e, subfolder.id)}
                className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-accent/50 transition-colors group"
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
      </div>
    </div>
  );
};
