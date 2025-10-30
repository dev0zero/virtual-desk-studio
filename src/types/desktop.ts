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
}

export interface ClipboardItem {
  type: 'copy' | 'cut';
  folderId: string;
}
