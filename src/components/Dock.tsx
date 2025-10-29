import { Folder as FolderLucide, FileText, Image, Music, Trash2 } from 'lucide-react';
import { Folder, WindowState } from '@/types/desktop';

interface DockProps {
  pinnedFolders: Folder[];
  windows: WindowState[];
  onFolderClick: (folder: Folder) => void;
  onWindowClick: (windowId: string) => void;
}

const defaultApps = [
  { icon: FileText, label: 'Документы', color: 'from-blue-500 to-blue-600' },
  { icon: Image, label: 'Изображения', color: 'from-purple-500 to-purple-600' },
  { icon: Music, label: 'Музыка', color: 'from-pink-500 to-pink-600' },
  { icon: Trash2, label: 'Корзина', color: 'from-gray-500 to-gray-600' },
];

export const Dock = ({ pinnedFolders, windows, onFolderClick, onWindowClick }: DockProps) => {
  const activeWindows = windows.filter(w => !w.isMinimized);
  const minimizedWindows = windows.filter(w => w.isMinimized);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl rounded-2xl px-4 py-3 shadow-2xl border border-white/20 dark:border-gray-700/20">
        <div className="flex items-center gap-3">
          {/* Default Apps */}
          {defaultApps.map((app, index) => {
            const Icon = app.icon;
            return (
              <button
                key={index}
                className={`dock-icon w-14 h-14 rounded-xl bg-gradient-to-br ${app.color} shadow-lg flex items-center justify-center relative group`}
              >
                <Icon className="w-7 h-7 text-white" />
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {app.label}
                </div>
              </button>
            );
          })}

          {/* Separator */}
          {(pinnedFolders.length > 0 || minimizedWindows.length > 0) && (
            <div className="w-px h-12 bg-border mx-1" />
          )}

          {/* Pinned Folders */}
          {pinnedFolders.map(folder => (
            <button
              key={folder.id}
              onClick={() => onFolderClick(folder)}
              className="dock-icon w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg flex items-center justify-center relative group"
            >
              <FolderLucide className="w-7 h-7 text-white" />
              {activeWindows.some(w => w.folderId === folder.id) && (
                <div className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />
              )}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {folder.name}
              </div>
            </button>
          ))}

          {/* Minimized Windows */}
          {minimizedWindows.map(window => (
            <button
              key={window.id}
              onClick={() => onWindowClick(window.id)}
              className="dock-icon w-14 h-14 rounded-xl bg-gradient-to-br from-secondary to-muted shadow-lg flex items-center justify-center relative group"
            >
              <FolderLucide className="w-7 h-7 text-foreground" />
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {window.title}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
