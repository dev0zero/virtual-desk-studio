import { useState } from 'react';
import { useDesktop } from '@/hooks/useDesktop';
import { FolderIcon } from './FolderIcon';
import { Window } from './Window';
import { Dock } from './Dock';
import { ContextMenu } from './ContextMenu';
import { toast } from 'sonner';
import { Folder } from '@/types/desktop';

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
    restoreWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
    copyFolder,
    cutFolder,
    pasteFolder,
    togglePin,
    renameFolder,
    maximizeWindow,
    addFileToFolder,
    moveToFolder,
    sortFolderContents,
    moveFolderByIdToFolder,
    moveFileToFolder,
    moveFolderToDesktop,
    updateSubfolderPosition,
    updateFilePosition,
    createTextFile,
    deleteFile,
    renameFile,
    deleteSubfolder,
    renameSubfolder,
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

  const handleDrag = (folderId: string, e: React.DragEvent) => {
    if (e.clientX === 0 && e.clientY === 0) return;
    // Position updates are handled in FolderIcon for smooth dragging
  };

  const handleDragEnd = (folderId: string, position: { x: number; y: number }) => {
    updateFolderPosition(folderId, position);
  };

  const handleSortFolders = () => {
    const sorted = [...folders].sort((a, b) => a.name.localeCompare(b.name));
    sorted.forEach((folder, index) => {
      const x = 50;
      const y = 50 + index * 130;
      updateFolderPosition(folder.id, { x, y });
    });
    toast.success('Папки упорядочены по имени');
  };

  const handleCreateFolder = (parentId?: string) => {
    const name = prompt('Введите имя новой папки:');
    if (name) {
      createFolder(
        name,
        contextMenu ? { x: contextMenu.x, y: contextMenu.y } : { x: 100, y: 100 },
        parentId
      );
      toast.success('Папка создана');
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder?.isTrash) {
      toast.error('Невозможно удалить корзину');
      return;
    }
    if (folder) {
      deleteFolder(folderId);
      toast.success('Папка перемещена в корзину');
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

  const handleRenameFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      const newName = prompt('Введите новое имя папки:', folder.name);
      if (newName && newName !== folder.name) {
        renameFolder(folderId, newName);
        toast.success('Папка переименована');
      }
    }
  };

  const pinnedFolders = folders.filter(f => f.isPinned);
  const currentFolder = contextMenu?.folderId ? folders.find(f => f.id === contextMenu.folderId) : undefined;

  const getFolderById = (id: string): Folder | undefined => {
    // Search in top-level folders
    const folder = folders.find(f => f.id === id);
    if (folder) return folder;
    
    // Search in subfolders
    for (const f of folders) {
      if (f.subFolders) {
        const subfolder = f.subFolders.find(sf => sf.id === id);
        if (subfolder) return subfolder;
      }
    }
    return undefined;
  };

  const handleSubfolderContextMenu = (e: React.MouseEvent, parentId: string, subfolderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, folderId: subfolderId });
  };

  const handleFolderDrop = (targetFolderId: string, sourceFolderId: string) => {
    if (targetFolderId === sourceFolderId) return;
    moveToFolder(sourceFolderId, targetFolderId);
    toast.success('Папка перемещена');
  };

  const handleDesktopDragOver = (e: React.DragEvent) => {
    // Allow dropping folders dragged from window contents
    if (e.dataTransfer.getData('source') === 'window-subfolder' && e.dataTransfer.getData('folderId')) {
      e.preventDefault();
    }
  };

  const handleDesktopDrop = (e: React.DragEvent) => {
    if (e.dataTransfer.getData('source') === 'window-subfolder') {
      e.preventDefault();
      const sourceFolderId = e.dataTransfer.getData('folderId');
      if (sourceFolderId) {
        moveFolderToDesktop(sourceFolderId, { x: e.clientX, y: e.clientY });
        toast.success('Папка перенесена на рабочий стол');
      }
    }
  };

  return (
    <div
      className="w-screen h-screen bg-gradient-to-br from-[hsl(var(--desktop-bg-start))] to-[hsl(var(--desktop-bg-end))] relative overflow-hidden"
      onContextMenu={handleDesktopContextMenu}
      onDragOver={handleDesktopDragOver}
      onDrop={handleDesktopDrop}
    >
      {/* Desktop Icons */}
      {folders.map(folder => (
        <FolderIcon
          key={folder.id}
          folder={folder}
          onDoubleClick={() => openWindow(folder)}
          onContextMenu={(e) => handleFolderContextMenu(e, folder.id)}
          onDrag={(e) => handleDrag(folder.id, e)}
          onDragEnd={(pos) => handleDragEnd(folder.id, pos)}
          onDrop={(targetId) => handleFolderDrop(targetId, folder.id)}
        />
      ))}

      {/* Windows */}
      {windows.map(window => {
        const windowFolder = getFolderById(window.folderId);
        if (!windowFolder) return null;
        
        return (
          <Window
            key={window.id}
            window={window}
            folder={windowFolder}
            onClose={() => closeWindow(window.id)}
            onMinimize={() => minimizeWindow(window.id)}
            onMaximize={() => maximizeWindow(window.id)}
            onFocus={() => focusWindow(window.id)}
            onMove={(x, y) => updateWindowPosition(window.id, { x, y })}
            onResize={(width, height) => updateWindowSize(window.id, { width, height })}
            onCreateSubfolder={handleCreateFolder}
            onUploadFile={(file) => addFileToFolder(window.folderId, file)}
            onOpenSubfolder={openWindow}
            onSubfolderContextMenu={handleSubfolderContextMenu}
            onSortContents={() => sortFolderContents(window.folderId)}
            onDropFolder={(sourceFolderId) => {
              if (sourceFolderId !== window.folderId) {
                moveFolderByIdToFolder(sourceFolderId, window.folderId);
                toast.success('Папка перемещена');
              }
            }}
            onUpdateSubfolderPosition={updateSubfolderPosition}
            onUpdateFilePosition={updateFilePosition}
            onCreateTextFile={createTextFile}
            onDeleteFile={deleteFile}
            onRenameFile={renameFile}
            onDeleteSubfolder={deleteSubfolder}
            onRenameSubfolder={renameSubfolder}
            onDropFileToWindow={(fileId, sourceFolderId) => {
              moveFileToFolder(sourceFolderId, fileId, window.folderId);
              toast.success('Файл перемещён');
            }}
            onDropSubfolderToWindow={(subfolderId, sourceFolderId) => {
              moveFolderByIdToFolder(subfolderId, window.folderId);
              toast.success('Папка перемещена');
            }}
          />
        );
      })}

      {/* Dock */}
      <Dock
        pinnedFolders={pinnedFolders}
        windows={windows}
        allFolders={folders}
        onFolderClick={openWindow}
        onWindowClick={(windowId) => {
          const w = windows.find(win => win.id === windowId);
          if (!w) return;
          if (w.isMinimized) {
            restoreWindow(windowId);
          } else {
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
          onPaste={!contextMenu.folderId && clipboard ? handlePaste : undefined}
          onSort={!contextMenu.folderId ? handleSortFolders : undefined}
          onCopy={contextMenu.folderId ? () => handleCopyFolder(contextMenu.folderId!) : undefined}
          onCut={contextMenu.folderId ? () => handleCutFolder(contextMenu.folderId!) : undefined}
          onRename={contextMenu.folderId ? () => handleRenameFolder(contextMenu.folderId!) : undefined}
          onDelete={contextMenu.folderId ? () => handleDeleteFolder(contextMenu.folderId!) : undefined}
          onPin={contextMenu.folderId ? () => handleTogglePin(contextMenu.folderId!) : undefined}
          isPinned={currentFolder?.isPinned}
        />
      )}
    </div>
  );
};
