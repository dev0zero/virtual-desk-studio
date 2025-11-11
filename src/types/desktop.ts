export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Folder {
  id: string;
  name: string;
  position: Position;
  isPinned?: boolean;
  parentId?: string;
  subFolders?: Folder[];
  files?: FileItem[];
  isDeleted?: boolean;
  isTrash?: boolean;
}

export interface WindowState {
  id: string;
  folderId: string;
  title: string;
  position: Position;
  size: Size;
  isMinimized: boolean;
  isMaximized: boolean;
  originalSize?: Size;
  originalPosition?: Position;
  zIndex: number;
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  position?: Position;
}

export interface ClipboardItem {
  type: 'copy' | 'cut';
  folderId: string;
}

export interface Shortcut {
  id: string;
  name: string;
  url: string;
  position: Position;
  isPinned?: boolean;
}
