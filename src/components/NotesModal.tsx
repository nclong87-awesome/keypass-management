import React, { useEffect, useRef, useState } from 'react';
import { KeyPass } from '../types';
import { FileText, X, Copy, Check, ExternalLink, Hash } from 'lucide-react';

interface NotesModalProps {
  item: KeyPass | null;
  onClose: () => void;
  onNotify?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const NotesModal: React.FC<NotesModalProps> = ({ item, onClose, onNotify }) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (item) {
      setCopied(false);
      const timer = setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [item]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && item) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCopyNotes = async () => {
    if (!item.notes) return;
    try {
      await navigator.clipboard.writeText(item.notes);
      setCopied(true);
      if (onNotify) {
        onNotify('Notes copied to clipboard!', 'success');
      }
      setTimeout(() => setCopied(false), 2000);
    } catch {
      if (onNotify) {
        onNotify('Failed to copy notes to clipboard.', 'error');
      }
    }
  };

  const lineCount = item.notes ? item.notes.split('\n').length : 0;
  const charCount = item.notes ? item.notes.length : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notes-modal-title"
      onClick={handleBackdropClick}
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2 text-indigo-600">
            <FileText className="w-5 h-5" />
            <h2 id="notes-modal-title" className="text-base font-bold text-slate-900 truncate">
              Notes details
            </h2>
          </div>
          <button
            type="button"
            id="btn-close-notes-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
          {/* Entry Info Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm truncate">{item.title}</span>
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-0.5">
                <Hash className="w-3 h-3" />
                {item.id.slice(0, 8)}
              </span>
            </div>
            {item.username && (
              <div className="text-slate-600">
                <span className="font-semibold text-slate-500">Username: </span>
                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">{item.username}</span>
              </div>
            )}
            {item.url && (
              <div className="text-slate-600 flex items-center gap-1">
                <span className="font-semibold text-slate-500">URL: </span>
                <a
                  href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline truncate max-w-[280px] font-medium flex items-center gap-0.5"
                >
                  <span className="truncate">{item.url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            )}
          </div>

          {/* Notes Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Full Notes ({charCount} chars{lineCount > 1 ? `, ${lineCount} lines` : ''})
              </span>
              {item.notes && (
                <button
                  type="button"
                  id="btn-copy-modal-notes"
                  onClick={handleCopyNotes}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Notes</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs whitespace-pre-wrap break-all max-h-72 overflow-y-auto leading-relaxed border border-slate-800 shadow-inner select-all">
              {item.notes || <span className="text-slate-500 italic">No notes provided for this entry.</span>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-200 bg-slate-50/80 shrink-0">
          <button
            ref={closeBtnRef}
            type="button"
            id="btn-notes-modal-close-footer"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-sm font-medium transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
