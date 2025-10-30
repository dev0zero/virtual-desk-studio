import { useState, useCallback } from 'react';
import { Folder, WindowState, ClipboardItem, Position, Size, FileItem } from '@/types/desktop';

const exampleFiles: FileItem[] = [
  { id: 'f1', name: 'example.jpg', type: 'image/jpeg', size: 1024000 },
  { id: 'f2', name: 'photo.png', type: 'image/png', size: 2048000 },
  { id: 'f3', name: 'animation.gif', type: 'image/gif', size: 512000 },
  { id: 'f4', name: 'song.mp3', type: 'audio/mp3', size: 3072000 },
  { id: 'f5', name: 'sound.wav', type: 'audio/wav', size: 4096000 },
  { id: 'f6', name: 'track.ogg', type: 'audio/ogg', size: 2560000 },
];

export const useDesktop = () => {
  const [folders, setFolders] = useState<Folder[]>([
    { id: '1', name: 'Документы', position: { x: 50, y: 50 }, files: [] },
    { id: '2', name: 'Картинки', position: { x: 50, y: 180 }, files: exampleFiles.filter(f => f.type.startsWith('image')) },
    { id: '3', name: 'Музыка', position: { x: 50, y: 310 }, files: exampleFiles.filter(f => f.type.startsWith('audio')) },
    { id: 'trash', name: 'Корзина', position: { x: 50, y: 440 }, files: [], isTrash: true, subFolders: [] },
  ]);

  const [windows, setWindows] = useState<WindowState[]>([]);
  const [clipboard, setClipboard] = useState<ClipboardItem | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(1);

  const createFolder = useCallback((name: string, position: Position, parentId?: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      position,
      parentId,
      subFolders: [],
    };
    
    if (parentId) {
      // Adding subfolder to parent
      setFolders(prev =>
        prev.map(f =>
          f.id === parentId
            ? { ...f, subFolders: [...(f.subFolders || []), newFolder] }
            : f
        )
      );
    } else {
      // Adding folder to desktop
      setFolders(prev => [...prev, newFolder]);
    }
  }, []);

  const deleteFolder = useCallback((id: string) => {
    const folder = folders.find(f => f.id === id);
    if (folder?.isTrash) return; // Cannot delete trash
    
    // Move to trash instead of deleting
    const trashFolder = folders.find(f => f.isTrash);
    if (trashFolder) {
      setFolders(prev =>
        prev.map(f => {
          if (f.isTrash) {
            return {
              ...f,
              subFolders: [...(f.subFolders || []), { ...folder!, isDeleted: true }],
            };
          }
          return f.id === id ? { ...f, isDeleted: true } : f;
        }).filter(f => !f.isDeleted || f.isTrash)
      );
    }
    setWindows(prev => prev.filter(w => w.folderId !== id));
  }, [folders]);

  const updateFolderPosition = useCallback((id: string, position: Position) => {
    setFolders(prev =>
      prev.map(f => (f.id === id ? { ...f, position } : f))
    );
  }, []);

  const openWindow = useCallback((folder: Folder) => {
    const existingWindow = windows.find(w => w.folderId === folder.id);
    
    if (existingWindow) {
      // Bring to front and unminimize
      setWindows(prev =>
        prev.map(w =>
          w.id === existingWindow.id
            ? { ...w, isMinimized: false, zIndex: maxZIndex + 1 }
            : w
        )
      );
      setMaxZIndex(prev => prev + 1);
    } else {
      // Create new window
      const newWindow: WindowState = {
        id: Date.now().toString(),
        folderId: folder.id,
        title: folder.name,
        position: { x: 200 + windows.length * 30, y: 100 + windows.length * 30 },
        size: { width: 600, height: 400 },
        isMinimized: false,
        isMaximized: false,
        zIndex: maxZIndex + 1,
      };
      setWindows(prev => [...prev, newWindow]);
      setMaxZIndex(prev => prev + 1);
    }
  }, [windows, maxZIndex]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMinimized: true } : w))
    );
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, zIndex: maxZIndex + 1 } : w))
    );
    setMaxZIndex(prev => prev + 1);
  }, [maxZIndex]);

  const updateWindowPosition = useCallback((id: string, position: Position) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, position } : w))
    );
  }, []);

  const updateWindowSize = useCallback((id: string, size: Size) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, size } : w))
    );
  }, []);

  const copyFolder = useCallback((id: string) => {
    setClipboard({ type: 'copy', folderId: id });
  }, []);

  const cutFolder = useCallback((id: string) => {
    setClipboard({ type: 'cut', folderId: id });
  }, []);

  const pasteFolder = useCallback((position: Position) => {
    if (!clipboard) return;

    const originalFolder = folders.find(f => f.id === clipboard.folderId);
    if (!originalFolder) return;

    if (clipboard.type === 'copy') {
      createFolder(`${originalFolder.name} (копия)`, position);
    } else if (clipboard.type === 'cut') {
      updateFolderPosition(clipboard.folderId, position);
      setClipboard(null);
    }
  }, [clipboard, folders, createFolder, updateFolderPosition]);

  const togglePin = useCallback((id: string) => {
    setFolders(prev =>
      prev.map(f => (f.id === id ? { ...f, isPinned: !f.isPinned } : f))
    );
  }, []);

  const renameFolder = useCallback((id: string, newName: string) => {
    setFolders(prev =>
      prev.map(f => (f.id === id ? { ...f, name: newName } : f))
    );
    setWindows(prev =>
      prev.map(w => (w.folderId === id ? { ...w, title: newName } : w))
    );
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w => {
        if (w.id === id) {
          if (w.isMaximized) {
            return {
              ...w,
              isMaximized: false,
              size: w.originalSize || { width: 600, height: 400 },
              position: w.originalPosition || { x: 200, y: 100 },
            };
          } else {
            return {
              ...w,
              isMaximized: true,
              originalSize: w.size,
              originalPosition: w.position,
              size: { width: window.innerWidth, height: window.innerHeight },
              position: { x: 0, y: 0 },
            };
          }
        }
        return w;
      })
    );
  }, []);

  const addFileToFolder = useCallback((folderId: string, file: FileItem) => {
    setFolders(prev =>
      prev.map(f =>
        f.id === folderId
          ? { ...f, files: [...(f.files || []), file] }
          : f
      )
    );
  }, []);

  const moveToFolder = useCallback((sourceFolderId: string, targetFolderId: string) => {
    const sourceFolder = folders.find(f => f.id === sourceFolderId);
    if (!sourceFolder || sourceFolderId === targetFolderId) return;

    setFolders(prev => {
      const updated = prev.map(f => {
        if (f.id === targetFolderId) {
          return {
            ...f,
            subFolders: [...(f.subFolders || []), { ...sourceFolder, parentId: targetFolderId }],
          };
        }
        return f;
      }).filter(f => f.id !== sourceFolderId);
      return updated;
    });
    
    setWindows(prev => prev.filter(w => w.folderId !== sourceFolderId));
  }, [folders]);

  const sortFolderContents = useCallback((folderId: string) => {
    setFolders(prev =>
      prev.map(f => {
        if (f.id === folderId && f.subFolders) {
          return {
            ...f,
            subFolders: [...f.subFolders].sort((a, b) => a.name.localeCompare(b.name)),
          };
        }
        return f;
      })
    );
  }, []);

  return {
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
  };
};
