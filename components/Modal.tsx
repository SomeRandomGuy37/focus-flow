
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'alert' | 'confirm';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'alert',
  onConfirm,
  confirmText = 'OK',
  cancelText = 'Cancel',
  variant = 'default'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-card border border-border rounded-[2rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
            <h3 className="text-xl font-bold tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                {message}
            </p>
        </div>

        <div className="flex gap-3 justify-center w-full">
            {type === 'confirm' && (
                <button 
                    onClick={onClose}
                    className="flex-1 px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                >
                    {cancelText}
                </button>
            )}
            <button 
                onClick={() => {
                    if (onConfirm) onConfirm();
                    onClose();
                }}
                className={`flex-1 px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all
                    ${variant === 'destructive' 
                        ? 'bg-destructive text-destructive-foreground' 
                        : 'bg-primary text-primary-foreground'
                    }
                `}
            >
                {confirmText}
            </button>
        </div>
      </div>
    </div>
  );
};
