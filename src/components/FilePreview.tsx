import { X, Music } from 'lucide-react';
import { FileItem } from '@/types/desktop';
import { useEffect } from 'react';

interface FilePreviewProps {
  file: FileItem;
  onClose: () => void;
}

export const FilePreview = ({ file, onClose }: FilePreviewProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const isImage = file.type.startsWith('image/');
  const isAudio = file.type.startsWith('audio/');

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-8"
      onClick={onClose}
    >
      <div 
        className="relative bg-background rounded-xl shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
          <h3 className="text-lg font-semibold text-foreground truncate">{file.name}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex items-center justify-center min-h-[300px]">
          {isImage && file.url && (
            <img 
              src={file.url} 
              alt={file.name}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
            />
          )}
          
          {isAudio && file.url && (
            <div className="w-full max-w-lg space-y-6">
              <div className="flex flex-col items-center gap-4 p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Music className="w-12 h-12 text-primary-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <audio 
                controls 
                className="w-full"
                autoPlay
              >
                <source src={file.url} type={file.type} />
                Ваш браузер не поддерживает аудио элемент.
              </audio>
            </div>
          )}

          {!isImage && !isAudio && (
            <div className="text-center text-muted-foreground py-12">
              <p className="text-lg">Предпросмотр недоступен для этого типа файла</p>
              <p className="text-sm mt-2">{file.type || 'Неизвестный тип'}</p>
            </div>
          )}
        </div>

        {/* Footer with file info */}
        <div className="p-4 border-t border-border bg-muted/30 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Тип: {file.type || 'Неизвестно'}</span>
            <span>Размер: {(file.size / 1024).toFixed(2)} KB</span>
          </div>
        </div>
      </div>
    </div>
  );
};
