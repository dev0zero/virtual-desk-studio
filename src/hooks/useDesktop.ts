import { useState, useCallback, useEffect } from 'react';
import { Folder, WindowState, ClipboardItem, Position, Size, FileItem, Shortcut } from '@/types/desktop';
import { loadFoldersFromBackend } from '@/services/api';

const exampleFiles: FileItem[] = [
  { id: 'f1', name: 'example.jpg', type: 'image/jpeg', size: 1024000, position: { x: 30, y: 30 } },
  { id: 'f2', name: 'photo.png', type: 'image/png', size: 2048000, position: { x: 150, y: 30 } },
  { id: 'f3', name: 'animation.gif', type: 'image/gif', size: 512000, position: { x: 270, y: 30 } },
  { id: 'f4', name: 'song.mp3', type: 'audio/mp3', size: 3072000, position: { x: 30, y: 30 } },
  { id: 'f5', name: 'sound.wav', type: 'audio/wav', size: 4096000, position: { x: 150, y: 30 } },
  { id: 'f6', name: 'track.ogg', type: 'audio/ogg', size: 2560000, position: { x: 270, y: 30 } },
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
  const [isLoading, setIsLoading] = useState(true);
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);

  // Загрузка данных с бэкенда при инициализации
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const loadedFolders = await loadFoldersFromBackend();
        if (loadedFolders.length > 0) {
          setFolders(loadedFolders);
        }
      } catch (error) {
        console.error('Ошибка при загрузке папок:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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
    // Find target folder and whether it's top-level or nested
    let target: Folder | undefined;
    let parentOfTargetId: string | undefined;

    const topLevel = folders.find(f => f.id === id);
    if (topLevel) {
      target = topLevel;
    } else {
      const parent = folders.find(f => f.subFolders?.some(sf => sf.id === id));
      const found = parent?.subFolders?.find(sf => sf.id === id);
      if (found) {
        target = found;
        parentOfTargetId = parent?.id;
      }
    }

    if (!target) return;
    if (target.isTrash) return; // Cannot delete trash

    // Move to trash instead of deleting
    const trashFolder = folders.find(f => f.isTrash);
    if (trashFolder) {
      setFolders(prev => {
        // Remove target from current location
        const removed = prev.map(f => {
          if (f.id === parentOfTargetId) {
            return { ...f, subFolders: (f.subFolders || []).filter(sf => sf.id !== id) };
          }
          return f;
        }).filter(f => f.id !== id);

        // Add to trash
        return removed.map(f => {
          if (f.isTrash) {
            return {
              ...f,
              subFolders: [...(f.subFolders || []), { ...target!, isDeleted: true }],
            };
          }
          return f;
        });
      });
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

  const restoreWindow = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMinimized: false, zIndex: maxZIndex + 1 } : w))
    );
    setMaxZIndex(prev => prev + 1);
  }, [maxZIndex]);

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
      prev.map(f => {
        if (f.id === id) return { ...f, name: newName };
        if (f.subFolders?.some(sf => sf.id === id)) {
          return {
            ...f,
            subFolders: (f.subFolders || []).map(sf => (sf.id === id ? { ...sf, name: newName } : sf)),
          };
        }
        return f;
      })
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
        if (f.id === folderId) {
          const sortedSubFolders = f.subFolders ? [...f.subFolders].sort((a, b) => a.name.localeCompare(b.name)) : [];
          const sortedFiles = f.files ? [...f.files].sort((a, b) => a.name.localeCompare(b.name)) : [];
          
          // Arrange items in a grid layout
          const allItems = [...sortedSubFolders, ...sortedFiles];
          const columns = 5;
          const spacingX = 120;
          const spacingY = 130;
          const startX = 30;
          const startY = 30;
          
          const positionedSubFolders = sortedSubFolders.map((sf, index) => ({
            ...sf,
            position: {
              x: startX + (index % columns) * spacingX,
              y: startY + Math.floor(index / columns) * spacingY,
            },
          }));
          
          const positionedFiles = sortedFiles.map((file, index) => ({
            ...file,
            position: {
              x: startX + ((index + sortedSubFolders.length) % columns) * spacingX,
              y: startY + Math.floor((index + sortedSubFolders.length) / columns) * spacingY,
            },
          }));
          
          return {
            ...f,
            subFolders: positionedSubFolders,
            files: positionedFiles,
          };
        }
        if (f.subFolders?.some(sf => sf.id === folderId)) {
          return {
            ...f,
            subFolders: (f.subFolders || []).map(sf => {
              if (sf.id === folderId) {
                const sortedSubFolders = sf.subFolders ? [...sf.subFolders].sort((a, b) => a.name.localeCompare(b.name)) : [];
                const sortedFiles = sf.files ? [...sf.files].sort((a, b) => a.name.localeCompare(b.name)) : [];
                
                const columns = 5;
                const spacingX = 120;
                const spacingY = 130;
                const startX = 30;
                const startY = 30;
                
                const positionedSubFolders = sortedSubFolders.map((ssf, index) => ({
                  ...ssf,
                  position: {
                    x: startX + (index % columns) * spacingX,
                    y: startY + Math.floor(index / columns) * spacingY,
                  },
                }));
                
                const positionedFiles = sortedFiles.map((file, index) => ({
                  ...file,
                  position: {
                    x: startX + ((index + sortedSubFolders.length) % columns) * spacingX,
                    y: startY + Math.floor((index + sortedSubFolders.length) / columns) * spacingY,
                  },
                }));
                
                return {
                  ...sf,
                  subFolders: positionedSubFolders,
                  files: positionedFiles,
                };
              }
              return sf;
            }),
          };
        }
        return f;
      })
    );
  }, []);

  const moveFolderByIdToFolder = useCallback((sourceFolderId: string, targetFolderId: string) => {
    if (sourceFolderId === targetFolderId) return;

    setFolders(prev => {
      let extracted: Folder | undefined;
      // Remove from current location
      const removed = prev.reduce<Folder[]>((acc, f) => {
        if (f.id === sourceFolderId) {
          extracted = { ...f };
          return acc; // skip adding this top-level folder
        }
        if (f.subFolders) {
          const idx = f.subFolders.findIndex(sf => sf.id === sourceFolderId);
          if (idx !== -1) {
            extracted = f.subFolders[idx];
            const newSubs = [...f.subFolders];
            newSubs.splice(idx, 1);
            acc.push({ ...f, subFolders: newSubs });
            return acc;
          }
        }
        acc.push(f);
        return acc;
      }, []);

      if (!extracted) return prev; // nothing to move

      // Add to target
      const added = removed.map(f =>
        f.id === targetFolderId
          ? { ...f, subFolders: [...(f.subFolders || []), { ...extracted!, parentId: targetFolderId }] }
          : f
      );

      return added;
    });

    setWindows(prev => prev.filter(w => w.folderId !== sourceFolderId));
  }, []);

  const moveFileToFolder = useCallback((sourceFolderId: string, fileId: string, targetFolderId: string) => {
    if (sourceFolderId === targetFolderId) return;
    let movedFile: FileItem | undefined;

    setFolders(prev => {
      // remove from source
      const removed = prev.map(f => {
        if (f.id === sourceFolderId) {
          const file = (f.files || []).find(fl => fl.id === fileId);
          if (file) movedFile = file;
          return { ...f, files: (f.files || []).filter(fl => fl.id !== fileId) };
        }
        if (f.subFolders?.some(sf => sf.id === sourceFolderId)) {
          return {
            ...f,
            subFolders: (f.subFolders || []).map(sf =>
              sf.id === sourceFolderId
                ? { ...sf, files: (sf.files || []).filter(fl => fl.id !== fileId) }
                : sf
            ),
          };
        }
        return f;
      });

      if (!movedFile) return prev;

      // add to target
      return removed.map(f => {
        if (f.id === targetFolderId) {
          return { ...f, files: [ ...(f.files || []), movedFile! ] };
        }
        if (f.subFolders?.some(sf => sf.id === targetFolderId)) {
          return {
            ...f,
            subFolders: (f.subFolders || []).map(sf =>
              sf.id === targetFolderId ? { ...sf, files: [ ...(sf.files || []), movedFile! ] } : sf
            ),
          };
        }
        return f;
      });
    });
  }, []);

  const pasteIntoFolder = useCallback((targetFolderId: string) => {
    if (!clipboard) return;
    const originalFolder = folders.find(f => f.id === clipboard.folderId) ||
      folders.flatMap(f => f.subFolders || []).find(sf => sf.id === clipboard.folderId);
    if (!originalFolder) return;

    if (clipboard.type === 'copy') {
      const name = `${originalFolder.name} (копия)`;
      // create as subfolder of target
      const newFolder: Folder = { ...originalFolder, id: Date.now().toString(), name, parentId: targetFolderId };
      setFolders(prev => prev.map(f => (
        f.id === targetFolderId
          ? { ...f, subFolders: [ ...(f.subFolders || []), newFolder ] }
          : f.subFolders?.some(sf => sf.id === targetFolderId)
            ? { ...f, subFolders: (f.subFolders || []).map(sf => sf.id === targetFolderId ? { ...sf, subFolders: [ ...(sf.subFolders || []), newFolder ] } : sf) }
            : f
      )));
    } else if (clipboard.type === 'cut') {
      moveFolderByIdToFolder(clipboard.folderId, targetFolderId);
      setClipboard(null);
    }
  }, [clipboard, folders, moveFolderByIdToFolder]);

  // Move a (sub)folder out to desktop as a top-level icon at a given position
  const moveFolderToDesktop = useCallback((sourceFolderId: string, position: Position) => {
    setFolders(prev => {
      let extracted: Folder | undefined;

      // Remove from current location (either top-level or nested)
      const removed = prev.reduce<Folder[]>((acc, f) => {
        if (f.id === sourceFolderId) {
          extracted = { ...f };
          return acc; // skip adding this top-level folder
        }
        if (f.subFolders) {
          const idx = f.subFolders.findIndex(sf => sf.id === sourceFolderId);
          if (idx !== -1) {
            extracted = { ...f.subFolders[idx] };
            const newSubs = [...f.subFolders];
            newSubs.splice(idx, 1);
            acc.push({ ...f, subFolders: newSubs });
            return acc;
          }
        }
        acc.push(f);
        return acc;
      }, []);

      if (!extracted) return prev; // nothing to move

      // Reset parentId and set new desktop position
      const toTopLevel: Folder = { ...extracted, parentId: undefined, position, subFolders: extracted.subFolders || [], files: extracted.files || [] };

      return [...removed, toTopLevel];
    });
    // Close any window tied to the moved folder (since its id stays the same, no need to update windows)
    setWindows(prev => prev);
  }, []);

  const updateSubfolderPosition = useCallback((folderId: string, subfolderId: string, position: Position) => {
    setFolders(prev =>
      prev.map(f => {
        if (f.id === folderId && f.subFolders) {
          return {
            ...f,
            subFolders: f.subFolders.map(sf =>
              sf.id === subfolderId ? { ...sf, position } : sf
            ),
          };
        }
        if (f.subFolders) {
          return {
            ...f,
            subFolders: f.subFolders.map(sf => {
              if (sf.id === folderId && sf.subFolders) {
                return {
                  ...sf,
                  subFolders: sf.subFolders.map(ssf =>
                    ssf.id === subfolderId ? { ...ssf, position } : ssf
                  ),
                };
              }
              return sf;
            }),
          };
        }
        return f;
      })
    );
  }, []);

  const updateFilePosition = useCallback((folderId: string, fileId: string, position: Position) => {
    setFolders(prev =>
      prev.map(f => {
        if (f.id === folderId && f.files) {
          return {
            ...f,
            files: f.files.map(file =>
              file.id === fileId ? { ...file, position } : file
            ),
          };
        }
        if (f.subFolders) {
          return {
            ...f,
            subFolders: f.subFolders.map(sf => {
              if (sf.id === folderId && sf.files) {
                return {
                  ...sf,
                  files: sf.files.map(file =>
                    file.id === fileId ? { ...file, position } : file
                  ),
                };
              }
              return sf;
            }),
          };
        }
        return f;
      })
    );
  }, []);

  const createTextFile = useCallback((folderId: string, fileName: string, position: Position) => {
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: fileName,
      type: 'text/plain',
      size: 0,
      position,
    };
    setFolders(prev =>
      prev.map(f => {
        if (f.id === folderId) {
          return { ...f, files: [...(f.files || []), newFile] };
        }
        if (f.subFolders) {
          return {
            ...f,
            subFolders: f.subFolders.map(sf =>
              sf.id === folderId ? { ...sf, files: [...(sf.files || []), newFile] } : sf
            ),
          };
        }
        return f;
      })
    );
  }, []);

  const deleteFile = useCallback((folderId: string, fileId: string) => {
    setFolders(prev =>
      prev.map(f => {
        if (f.id === folderId) {
          return { ...f, files: (f.files || []).filter(file => file.id !== fileId) };
        }
        if (f.subFolders) {
          return {
            ...f,
            subFolders: f.subFolders.map(sf =>
              sf.id === folderId ? { ...sf, files: (sf.files || []).filter(file => file.id !== fileId) } : sf
            ),
          };
        }
        return f;
      })
    );
  }, []);

  const renameFile = useCallback((folderId: string, fileId: string, newName: string) => {
    setFolders(prev =>
      prev.map(f => {
        if (f.id === folderId && f.files) {
          return {
            ...f,
            files: f.files.map(file =>
              file.id === fileId ? { ...file, name: newName } : file
            ),
          };
        }
        if (f.subFolders) {
          return {
            ...f,
            subFolders: f.subFolders.map(sf => {
              if (sf.id === folderId && sf.files) {
                return {
                  ...sf,
                  files: sf.files.map(file =>
                    file.id === fileId ? { ...file, name: newName } : file
                  ),
                };
              }
              return sf;
            }),
          };
        }
        return f;
      })
    );
  }, []);

  const deleteSubfolder = useCallback((parentId: string, subfolderId: string) => {
    setFolders(prev =>
      prev.map(f => {
        if (f.id === parentId && f.subFolders) {
          return {
            ...f,
            subFolders: f.subFolders.filter(sf => sf.id !== subfolderId),
          };
        }
        if (f.subFolders) {
          return {
            ...f,
            subFolders: f.subFolders.map(sf => {
              if (sf.id === parentId && sf.subFolders) {
                return {
                  ...sf,
                  subFolders: sf.subFolders.filter(ssf => ssf.id !== subfolderId),
                };
              }
              return sf;
            }),
          };
        }
        return f;
      })
    );
    setWindows(prev => prev.filter(w => w.folderId !== subfolderId));
  }, []);

  const renameSubfolder = useCallback((parentId: string, subfolderId: string, newName: string) => {
    setFolders(prev =>
      prev.map(f => {
        if (f.id === parentId && f.subFolders) {
          return {
            ...f,
            subFolders: f.subFolders.map(sf =>
              sf.id === subfolderId ? { ...sf, name: newName } : sf
            ),
          };
        }
        if (f.subFolders) {
          return {
            ...f,
            subFolders: f.subFolders.map(sf => {
              if (sf.id === parentId && sf.subFolders) {
                return {
                  ...sf,
                  subFolders: sf.subFolders.map(ssf =>
                    ssf.id === subfolderId ? { ...ssf, name: newName } : ssf
                  ),
                };
              }
              return sf;
            }),
          };
        }
        return f;
      })
    );
    setWindows(prev =>
      prev.map(w => (w.folderId === subfolderId ? { ...w, title: newName } : w))
    );
  }, []);

  const createShortcut = useCallback((name: string, url: string, position: Position) => {
    const newShortcut: Shortcut = {
      id: Date.now().toString(),
      name,
      url,
      position,
    };
    setShortcuts(prev => [...prev, newShortcut]);
  }, []);

  const deleteShortcut = useCallback((id: string) => {
    setShortcuts(prev => prev.filter(s => s.id !== id));
    setWindows(prev => prev.filter(w => w.folderId !== id));
  }, []);

  const updateShortcutPosition = useCallback((id: string, position: Position) => {
    setShortcuts(prev => prev.map(s => (s.id === id ? { ...s, position } : s)));
  }, []);

  const renameShortcut = useCallback((id: string, newName: string) => {
    setShortcuts(prev => prev.map(s => (s.id === id ? { ...s, name: newName } : s)));
    setWindows(prev => prev.map(w => (w.folderId === id ? { ...w, title: newName } : w)));
  }, []);

  const toggleShortcutPin = useCallback((id: string) => {
    setShortcuts(prev => prev.map(s => (s.id === id ? { ...s, isPinned: !s.isPinned } : s)));
  }, []);

  const openShortcut = useCallback((shortcut: Shortcut) => {
    const existingWindow = windows.find(w => w.folderId === shortcut.id);
    
    if (existingWindow) {
      setWindows(prev =>
        prev.map(w =>
          w.id === existingWindow.id
            ? { ...w, isMinimized: false, zIndex: maxZIndex + 1 }
            : w
        )
      );
      setMaxZIndex(prev => prev + 1);
    } else {
      const newWindow: WindowState = {
        id: Date.now().toString(),
        folderId: shortcut.id,
        title: shortcut.name,
        position: { x: 200 + windows.length * 30, y: 100 + windows.length * 30 },
        size: { width: 800, height: 600 },
        isMinimized: false,
        isMaximized: false,
        zIndex: maxZIndex + 1,
      };
      setWindows(prev => [...prev, newWindow]);
      setMaxZIndex(prev => prev + 1);
    }
  }, [windows, maxZIndex]);

  return {
    folders,
    windows,
    clipboard,
    isLoading,
    shortcuts,
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
    moveFolderByIdToFolder,
    moveFileToFolder,
    moveFolderToDesktop,
    sortFolderContents,
    updateSubfolderPosition,
    updateFilePosition,
    createTextFile,
    deleteFile,
    renameFile,
    deleteSubfolder,
    renameSubfolder,
    createShortcut,
    deleteShortcut,
    updateShortcutPosition,
    renameShortcut,
    toggleShortcutPin,
    openShortcut,
  };
};
