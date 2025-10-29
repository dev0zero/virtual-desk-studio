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
}

export interface WindowState {
  id: string;
  folderId: string;
  title: string;
  position: Position;
  size: Size;
  isMinimized: boolean;
  zIndex: number;
}

export interface ClipboardItem {
  type: 'copy' | 'cut';
  folderId: string;
}
