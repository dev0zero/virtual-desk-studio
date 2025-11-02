import { Folder, WindowState } from '@/types/desktop';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';

interface DockProps {
  pinnedFolders: Folder[];
  windows: WindowState[];
  onFolderClick: (folder: Folder) => void;
  onWindowClick: (windowId: string) => void;
  allFolders: Folder[];
}

export const Dock = ({ pinnedFolders, windows, onFolderClick, onWindowClick, allFolders }: DockProps) => {
  const [hiddenApps, setHiddenApps] = useState<string[]>([]);
  const activeWindows = windows.filter(w => !w.isMinimized);
  const minimizedWindows = windows.filter(w => w.isMinimized);
  const trashFolder = allFolders.find(f => f.isTrash);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl rounded-2xl px-4 py-3 shadow-2xl border border-white/20 dark:border-gray-700/20 select-none">
        <div className="flex items-center gap-3">
          {/* Trash Folder */}
          {trashFolder && (
            <button
              onClick={() => onFolderClick(trashFolder)}
              className="dock-icon w-14 h-14 rounded-xl shadow-lg flex items-center justify-center relative group overflow-hidden bg-gradient-to-b from-gray-500 to-gray-600"
            >
              <Trash2 className="w-8 h-8 text-white" strokeWidth={2} />
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {trashFolder.name}
              </div>
            </button>
          )}

          {/* Separator */}
          {(pinnedFolders.length > 0 || minimizedWindows.length > 0) && (
            <div className="w-px h-12 bg-border mx-1" />
          )}

          {/* Pinned Folders */}
          {pinnedFolders.map(folder => (
            <button
              key={folder.id}
              onClick={() => onFolderClick(folder)}
              className="dock-icon w-14 h-14 rounded-xl shadow-lg flex items-center justify-center relative group overflow-hidden"
            >
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <defs>
                  <linearGradient id={`dock-folder-${folder.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="1" />
                  </linearGradient>
                </defs>
                <path d="M 8 20 L 8 52 C 8 54 9 56 11 56 L 53 56 C 55 56 56 54 56 52 L 56 24 C 56 22 55 20 53 20 Z" fill={`url(#dock-folder-${folder.id})`} opacity="0.85" />
                <path d="M 8 20 L 8 14 C 8 12 9 10 11 10 L 26 10 L 30 16 L 53 16 C 55 16 56 17 56 19 L 56 20 Z" fill={`url(#dock-folder-${folder.id})`} />
              </svg>
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
              className="dock-icon w-14 h-14 rounded-xl shadow-lg flex items-center justify-center relative group overflow-hidden"
            >
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <defs>
                  <linearGradient id={`dock-min-${window.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="1" />
                  </linearGradient>
                </defs>
                <path d="M 8 20 L 8 52 C 8 54 9 56 11 56 L 53 56 C 55 56 56 54 56 52 L 56 24 C 56 22 55 20 53 20 Z" fill={`url(#dock-min-${window.id})`} opacity="0.85" />
                <path d="M 8 20 L 8 14 C 8 12 9 10 11 10 L 26 10 L 30 16 L 53 16 C 55 16 56 17 56 19 L 56 20 Z" fill={`url(#dock-min-${window.id})`} />
              </svg>
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
