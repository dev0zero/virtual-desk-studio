import { useState } from 'react';
import { useDesktop } from '@/hooks/useDesktop';
import { FolderIcon } from './FolderIcon';
import { Window } from './Window';
import { Dock } from './Dock';
import { ContextMenu } from './ContextMenu';
import { toast } from 'sonner';

interface ContextMenuState {
  x: number;
  y: number;
  folderId?: string;
}

export const Desktop = () => {
  const {
    folders,
    windows,
    clipboard,
    createFolder,
    deleteFolder,
    updateFolderPosition,
    openWindow,
    closeWindow,
    minimizeWindow,
    focusWindow,
    updateWindowPosition,
    copyFolder,
    cutFolder,
    pasteFolder,
    togglePin,
  } = useDesktop();

  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleFolderContextMenu = (e: React.MouseEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, folderId });
  };

  const handleDragEnd = (folderId: string, e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    updateFolderPosition(folderId, {
      x: e.clientX - rect.width / 2,
      y: e.clientY - rect.height / 2,
    });
  };

  const handleCreateFolder = () => {
    const name = prompt('Введите имя новой папки:');
    if (name) {
      createFolder(name, contextMenu ? { x: contextMenu.x, y: contextMenu.y } : { x: 100, y: 100 });
      toast.success('Папка создана');
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder && confirm(`Удалить папку "${folder.name}"?`)) {
      deleteFolder(folderId);
      toast.success('Папка удалена');
    }
  };

  const handleCopyFolder = (folderId: string) => {
    copyFolder(folderId);
    toast.success('Папка скопирована');
  };

  const handleCutFolder = (folderId: string) => {
    cutFolder(folderId);
    toast.success('Папка вырезана');
  };

  const handlePaste = () => {
    if (clipboard && contextMenu) {
      pasteFolder({ x: contextMenu.x, y: contextMenu.y });
      toast.success('Папка вставлена');
    }
  };

  const handleTogglePin = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    togglePin(folderId);
    toast.success(folder?.isPinned ? 'Открепить от дока' : 'Закреплено в доке');
  };

  const pinnedFolders = folders.filter(f => f.isPinned);
  const currentFolder = contextMenu?.folderId ? folders.find(f => f.id === contextMenu.folderId) : undefined;

  return (
    <div
      className="w-screen h-screen bg-gradient-to-br from-[hsl(var(--desktop-bg-start))] to-[hsl(var(--desktop-bg-end))] relative overflow-hidden"
      onContextMenu={handleDesktopContextMenu}
    >
      {/* Desktop Icons */}
      {folders.map(folder => (
        <FolderIcon
          key={folder.id}
          folder={folder}
          onDoubleClick={() => openWindow(folder)}
          onContextMenu={(e) => handleFolderContextMenu(e, folder.id)}
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = 'move';
          }}
          onDragEnd={(e) => handleDragEnd(folder.id, e)}
        />
      ))}

      {/* Windows */}
      {windows.map(window => (
        <Window
          key={window.id}
          window={window}
          onClose={() => closeWindow(window.id)}
          onMinimize={() => minimizeWindow(window.id)}
          onFocus={() => focusWindow(window.id)}
          onMove={(x, y) => updateWindowPosition(window.id, { x, y })}
        />
      ))}

      {/* Dock */}
      <Dock
        pinnedFolders={pinnedFolders}
        windows={windows}
        onFolderClick={openWindow}
        onWindowClick={(windowId) => {
          const window = windows.find(w => w.id === windowId);
          if (window) {
            minimizeWindow(windowId);
            focusWindow(windowId);
          }
        }}
      />

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onNew={!contextMenu.folderId ? handleCreateFolder : undefined}
          onCopy={contextMenu.folderId ? () => handleCopyFolder(contextMenu.folderId!) : undefined}
          onCut={contextMenu.folderId ? () => handleCutFolder(contextMenu.folderId!) : undefined}
          onDelete={contextMenu.folderId ? () => handleDeleteFolder(contextMenu.folderId!) : undefined}
          onPin={contextMenu.folderId ? () => handleTogglePin(contextMenu.folderId!) : undefined}
          isPinned={currentFolder?.isPinned}
        />
      )}
    </div>
  );
};
