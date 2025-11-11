import { Copy, Scissors, Trash2, Plus, Pin, PinOff, Clipboard, ArrowDownAZ, Edit, FolderOpen, Link } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCopy?: () => void;
  onCut?: () => void;
  onDelete?: () => void;
  onNew?: () => void;
  onPaste?: () => void;
  onSort?: () => void;
  onPin?: () => void;
  onRename?: () => void;
  onOpen?: () => void;
  onNewFile?: () => void;
  onNewShortcut?: () => void;
  isPinned?: boolean;
}

export const ContextMenu = ({
  x,
  y,
  onClose,
  onCopy,
  onCut,
  onDelete,
  onNew,
  onPaste,
  onSort,
  onPin,
  onRename,
  onOpen,
  onNewFile,
  onNewShortcut,
  isPinned,
}: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust position to keep menu within viewport
  useEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();

      let adjustedX = x;
      let adjustedY = y;

      if (x + rect.width > window.innerWidth) {
        adjustedX = window.innerWidth - rect.width - 8;
      }
      if (y + rect.height > window.innerHeight) {
        adjustedY = window.innerHeight - rect.height - 8;
      }

      adjustedX = Math.max(8, adjustedX);
      adjustedY = Math.max(8, adjustedY);

      menu.style.left = `${adjustedX}px`;
      menu.style.top = `${adjustedY}px`;
    }
  }, [x, y]);

  const menuItems = [
    onNew && { icon: Plus, label: 'Создать папку', action: onNew },
    onNewShortcut && { icon: Link, label: 'Создать ярлык', action: onNewShortcut },
    onNewFile && { icon: Plus, label: 'Создать текстовый файл', action: onNewFile },
    onPaste && { icon: Clipboard, label: 'Вставить', action: onPaste },
    onSort && { icon: ArrowDownAZ, label: 'Упорядочить по имени', action: onSort },
    onOpen && { icon: FolderOpen, label: 'Открыть', action: onOpen },
    onCopy && { icon: Copy, label: 'Копировать', action: onCopy },
    onCut && { icon: Scissors, label: 'Вырезать', action: onCut },
    onRename && { icon: Edit, label: 'Переименовать', action: onRename },
    onPin && {
      icon: isPinned ? PinOff : Pin,
      label: isPinned ? 'Открепить от дока' : 'Закрепить в доке',
      action: onPin,
    },
    onDelete && { icon: Trash2, label: 'Удалить', action: onDelete, danger: true },
  ].filter(Boolean);

  return createPortal(
    <div
      ref={menuRef}
      className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-border z-[9999] min-w-[200px] py-1 animate-scale-in"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        pointerEvents: 'auto',
      }}
    >
      {menuItems.map((item, index) => {
        if (!item) return null;
        const Icon = item.icon;
        return (
          <button
            key={index}
            onClick={() => {
              item.action();
              onClose();
            }}
            className={`w-full px-4 py-2 flex items-center gap-3 hover:bg-accent transition-colors text-left ${
              item.danger ? 'text-destructive hover:text-destructive' : 'text-foreground'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm">{item.label}</span>
          </button>
        );
      })}
    </div>,
    document.body
  );
};
