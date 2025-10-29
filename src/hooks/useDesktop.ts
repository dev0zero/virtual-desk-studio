import { useState, useCallback } from 'react';
import { Folder, WindowState, ClipboardItem, Position, Size } from '@/types/desktop';

export const useDesktop = () => {
  const [folders, setFolders] = useState<Folder[]>([
    { id: '1', name: 'Документы', position: { x: 50, y: 50 } },
    { id: '2', name: 'Картинки', position: { x: 50, y: 180 } },
    { id: '3', name: 'Музыка', position: { x: 50, y: 310 } },
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
    setFolders(prev => prev.filter(f => f.id !== id));
    setWindows(prev => prev.filter(w => w.folderId !== id));
  }, []);

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
  };
};
