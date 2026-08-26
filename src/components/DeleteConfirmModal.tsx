import React, { useEffect, useRef } from 'react';
import { KeyPass } from '../types';
import { AlertTriangle, Trash2, X, Loader2, Folder, User } from 'lucide-react';

interface DeleteConfirmModalProps {
  item: KeyPass | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  item,
  loading,
  onClose,
  onConfirm,
}) => {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  // Auto focus Cancel button on open for keyboard accessibility & safety
  useEffect(() => {
    if (item) {
      const timer = setTimeout(() => {
        cancelBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [item]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && item && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, loading, onClose]);

  if (!item) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    try {
      await onConfirm(item.id);
    } catch {
      // Error handled by parent component
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      onClick={handleBackdropClick}
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-rose-50/50">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h2 id="delete-modal-title" className="text-lg font-semibold text-slate-900">
              Confirm Deletion
            </h2>
          </div>
          <button
            type="button"
            id="btn-close-delete-modal"
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently delete this KeyPass entry? This action cannot be undone.
          </p>

          {/* Entry details (Title, Group, Username only - NEVER password) */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
            <div>
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Title
              </span>
              <p className="text-sm font-bold text-slate-900">{item.title}</p>
            </div>

            {item.group && (
              <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-mono">
                <Folder className="w-3.5 h-3.5" />
                <span>{item.group}</span>
              </div>
            )}

            {item.username && (
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.username}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              ref={cancelBtnRef}
              autoFocus
              type="button"
              id="btn-cancel-delete"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              id="btn-confirm-delete"
              onClick={handleConfirm}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Entry</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
