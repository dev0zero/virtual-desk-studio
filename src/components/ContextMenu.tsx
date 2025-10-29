import { Copy, Scissors, Trash2, Plus, Pin, PinOff } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCopy?: () => void;
  onCut?: () => void;
  onDelete?: () => void;
  onNew?: () => void;
  onPin?: () => void;
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
  onPin,
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

  const menuItems = [
    onNew && { icon: Plus, label: 'Создать папку', action: onNew },
    onCopy && { icon: Copy, label: 'Копировать', action: onCopy },
    onCut && { icon: Scissors, label: 'Вырезать', action: onCut },
    onPin && {
      icon: isPinned ? PinOff : Pin,
      label: isPinned ? 'Открепить от дока' : 'Закрепить в доке',
      action: onPin,
    },
    onDelete && { icon: Trash2, label: 'Удалить', action: onDelete, danger: true },
  ].filter(Boolean);

  return (
    <div
      ref={menuRef}
      className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-border z-[9999] min-w-[200px] py-1 animate-scale-in"
      style={{
        left: `${x}px`,
        top: `${y}px`,
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
    </div>
  );
};
