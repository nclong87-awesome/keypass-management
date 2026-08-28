import React, { useState } from 'react';
import { KeyPass } from '../types';
import { NotesModal } from './NotesModal';
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Calendar,
  User,
  Hash,
  FileText,
  Lock,
} from 'lucide-react';

interface ResultsViewProps {
  items: KeyPass[];
  revealedIds: Set<string>;
  onToggleReveal: (id: string) => void;
  onEdit: (item: KeyPass) => void;
  onDelete: (item: KeyPass) => void;
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  items,
  revealedIds,
  onToggleReveal,
  onEdit,
  onDelete,
  onNotify,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedUsernameId, setCopiedUsernameId] = useState<string | null>(null);
  const [selectedNotesItem, setSelectedNotesItem] = useState<KeyPass | null>(null);

  const handleCopyPassword = async (item: KeyPass) => {
    if (item.password === '[unavailable]') {
      onNotify('Password is unavailable for this entry.', 'error');
      return;
    }

    try {
      await navigator.clipboard.writeText(item.password);
      setCopiedId(item.id);
      onNotify(`Password for ${item.title} copied to clipboard!`, 'success');
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch {
      onNotify('Failed to copy password to clipboard.', 'error');
    }
  };

  const handleCopyUsername = async (item: KeyPass) => {
    if (!item.username) return;

    try {
      await navigator.clipboard.writeText(item.username);
      setCopiedUsernameId(item.id);
      onNotify(`Username for ${item.title} copied to clipboard!`, 'success');
      setTimeout(() => {
        setCopiedUsernameId(null);
      }, 2000);
    } catch {
      onNotify('Failed to copy username to clipboard.', 'error');
    }
  };

  const handleCopyUrl = async (url: string, title: string) => {
    try {
      await navigator.clipboard.writeText(url);
      onNotify(`URL for ${title} copied to clipboard!`, 'success');
    } catch {
      onNotify('Failed to copy URL to clipboard.', 'error');
    }
  };

  const getMaskedPassword = (password: string): string => {
    if (!password || password === '[unavailable]') return '—';
    if (password.length <= 4) return `...${password}`;
    return `...${password.slice(-4)}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateString;
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4" id="results-view-container">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-xs">
        <table className="w-full text-left border-collapse table-fixed" id="results-desktop-table">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4 w-[18%]">Title</th>
              <th className="py-3.5 px-4 w-[15%]">Username</th>
              <th className="py-3.5 px-4 w-[22%]">Password</th>
              <th className="py-3.5 px-4 w-[20%]">URL</th>
              <th className="py-3.5 px-4 w-[13%]">Notes</th>
              <th className="py-3.5 px-4 w-[12%]">Modified</th>
              <th className="py-3.5 px-4 w-[10%] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {items.map((item) => {
              const isRevealed = revealedIds.has(item.id);
              const isUnavailable = item.password === '[unavailable]';

              return (
                <tr
                  key={item.id}
                  id={`keypass-row-${item.id}`}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Title & ID */}
                  <td className="py-3.5 px-4 align-middle overflow-hidden">
                    <div className="font-semibold text-slate-900 truncate" title={item.title}>
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1" title={`ID: ${item.id}`}>
                      <Hash className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{item.id}</span>
                    </div>
                  </td>

                  {/* Username */}
                  <td className="py-3.5 px-4 align-middle overflow-hidden">
                    {item.username ? (
                      <div className="flex items-center gap-1.5 min-w-0 max-w-full">
                        <span className="text-slate-700 font-mono text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200 inline-block max-w-full truncate flex-1 min-w-0" title={item.username}>
                          {item.username}
                        </span>
                        <button
                          type="button"
                          id={`btn-copy-username-${item.id}`}
                          onClick={() => handleCopyUsername(item)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 shrink-0 transition-colors"
                          aria-label={`Copy username for ${item.title}`}
                          title={`Copy username for ${item.title}`}
                        >
                          {copiedUsernameId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-xs">—</span>
                    )}
                  </td>

                  {/* Password field with reveal and copy */}
                  <td className="py-3.5 px-4 align-middle overflow-hidden">
                    {isUnavailable ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs font-medium">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span>[Unavailable]</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="relative flex-1 min-w-0">
                          <input
                            type="text"
                            value={isRevealed ? item.password : getMaskedPassword(item.password)}
                            readOnly
                            tabIndex={-1}
                            className={`w-full border rounded px-2 py-1 text-xs font-mono select-all focus:outline-none truncate ${
                              isRevealed
                                ? 'bg-indigo-50/60 border-indigo-200 text-indigo-900 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-indigo-600 font-medium'
                            }`}
                            aria-label={`Password field for ${item.title}`}
                          />
                        </div>

                        {/* Toggle reveal */}
                        <button
                          type="button"
                          id={`btn-toggle-password-${item.id}`}
                          onClick={() => onToggleReveal(item.id)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors border border-slate-200 shrink-0"
                          aria-label={
                            isRevealed
                              ? `Hide password for ${item.title}`
                              : `Show password for ${item.title}`
                          }
                          title={
                            isRevealed
                              ? `Hide password for ${item.title}`
                              : `Show password for ${item.title}`
                          }
                        >
                          {isRevealed ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Copy password */}
                        <button
                          type="button"
                          id={`btn-copy-password-${item.id}`}
                          onClick={() => handleCopyPassword(item)}
                          disabled={isUnavailable}
                          className={`p-1.5 rounded-lg transition-colors border shrink-0 ${
                            isUnavailable
                              ? 'bg-slate-50 text-slate-300 cursor-not-allowed border-slate-100'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border-slate-200'
                          }`}
                          aria-label={`Copy password for ${item.title}`}
                          title={`Copy password for ${item.title}`}
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </td>

                  {/* URL */}
                  <td className="py-3.5 px-4 align-middle overflow-hidden">
                    {item.url ? (
                      <div className="flex items-center gap-1 min-w-0 max-w-full">
                        <a
                          href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 hover:text-indigo-700 text-xs flex items-center gap-1 truncate hover:underline font-medium min-w-0 flex-1"
                          title={item.url}
                        >
                          <span className="truncate">{item.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(item.url, item.title)}
                          className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded shrink-0 transition-colors"
                          title="Copy URL"
                          aria-label={`Copy URL for ${item.title}`}
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-xs">—</span>
                    )}
                  </td>

                  {/* Notes */}
                  <td className="py-3.5 px-4 align-middle overflow-hidden">
                    {item.notes ? (
                      <button
                        type="button"
                        id={`btn-view-notes-${item.id}`}
                        onClick={() => setSelectedNotesItem(item)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors max-w-full text-xs font-medium group/btn cursor-pointer"
                        title="Click to view full notes details"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate max-w-[80px] xl:max-w-[120px] text-slate-600">
                          {item.notes.replace(/\s+/g, ' ')}
                        </span>
                        <span className="text-[11px] text-indigo-600 font-semibold group-hover/btn:underline shrink-0 ml-0.5">
                          View
                        </span>
                      </button>
                    ) : (
                      <span className="text-slate-400 italic text-xs">—</span>
                    )}
                  </td>

                  {/* Dates - Modified (prefers updatedAt if present) */}
                  <td className="py-3.5 px-4 align-middle text-xs text-slate-500 overflow-hidden">
                    <div
                      className="truncate"
                      title={
                        item.updatedAt
                          ? `Modified: ${formatDate(item.updatedAt)} (Created: ${formatDate(item.createdAt)})`
                          : `Created: ${formatDate(item.createdAt)}`
                      }
                    >
                      {formatDate(item.updatedAt || item.createdAt)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 align-middle text-right shrink-0">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        id={`btn-edit-entry-${item.id}`}
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                        aria-label={`Edit entry ${item.title}`}
                        title="Edit entry"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        id={`btn-delete-entry-${item.id}`}
                        onClick={() => onDelete(item)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                        aria-label={`Delete entry ${item.title}`}
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards View */}
      <div className="lg:hidden space-y-3" id="results-mobile-cards">
        {items.map((item) => {
          const isRevealed = revealedIds.has(item.id);
          const isUnavailable = item.password === '[unavailable]';

          return (
            <div
              key={item.id}
              id={`keypass-card-${item.id}`}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3"
            >
              {/* Header: Title & Actions */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {item.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    id={`btn-mobile-edit-${item.id}`}
                    onClick={() => onEdit(item)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                    aria-label={`Edit entry ${item.title}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    id={`btn-mobile-delete-${item.id}`}
                    onClick={() => onDelete(item)}
                    className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-200"
                    aria-label={`Delete entry ${item.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Username */}
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-500 font-medium shrink-0">User:</span>
                    <span className="text-slate-800 font-mono truncate">
                      {item.username || '—'}
                    </span>
                  </div>
                  {item.username && (
                    <button
                      type="button"
                      id={`btn-mobile-copy-username-${item.id}`}
                      onClick={() => handleCopyUsername(item)}
                      className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded border border-slate-200 shrink-0 transition-colors"
                      aria-label={`Copy username for ${item.title}`}
                      title={`Copy username for ${item.title}`}
                    >
                      {copiedUsernameId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* URL */}
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-500 font-medium">URL:</span>
                  {item.url ? (
                    <a
                      href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline truncate font-medium"
                    >
                      {item.url}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">—</span>
                  )}
                </div>
              </div>

              {/* Password control block */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-medium">
                    <Lock className="w-3 h-3 text-slate-400" />
                    Password:
                  </span>
                  {isUnavailable ? (
                    <span className="text-amber-700 font-medium text-[11px]">
                      [Unavailable]
                    </span>
                  ) : null}
                </div>

                {isUnavailable ? (
                  <p className="text-xs text-amber-700 italic">
                    The backend returned an unavailable password indicator.
                  </p>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={isRevealed ? item.password : getMaskedPassword(item.password)}
                      readOnly
                      tabIndex={-1}
                      className={`flex-1 border rounded px-3 py-1.5 text-xs font-mono select-all min-w-0 ${
                        isRevealed
                          ? 'bg-indigo-50/60 border-indigo-200 text-indigo-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-indigo-600 font-medium'
                      }`}
                    />
                    <button
                      type="button"
                      id={`btn-mobile-toggle-pwd-${item.id}`}
                      onClick={() => onToggleReveal(item.id)}
                      className="p-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-200"
                      aria-label={
                        isRevealed
                          ? `Hide password for ${item.title}`
                          : `Show password for ${item.title}`
                      }
                    >
                      {isRevealed ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      id={`btn-mobile-copy-pwd-${item.id}`}
                      onClick={() => handleCopyPassword(item)}
                      disabled={isUnavailable}
                      className={`p-2 rounded-lg border transition-colors ${
                        isUnavailable
                          ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                      aria-label={`Copy password for ${item.title}`}
                      title={`Copy password for ${item.title}`}
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Notes */}
              {item.notes && (
                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-slate-600">
                      {item.notes.replace(/\s+/g, ' ')}
                    </span>
                  </div>
                  <button
                    type="button"
                    id={`btn-mobile-view-notes-${item.id}`}
                    onClick={() => setSelectedNotesItem(item)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-indigo-600 font-semibold border border-slate-200 rounded-md text-xs shrink-0 flex items-center gap-1 shadow-2xs transition-colors"
                  >
                    <span>View Notes</span>
                  </button>
                </div>
              )}

              {/* Footer dates & ID */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
                <span
                  className="flex items-center gap-1"
                  title={
                    item.updatedAt
                      ? `Modified: ${formatDate(item.updatedAt)} (Created: ${formatDate(item.createdAt)})`
                      : `Created: ${formatDate(item.createdAt)}`
                  }
                >
                  <Calendar className="w-3 h-3" />
                  {formatDate(item.updatedAt || item.createdAt)}
                </span>
                <span>ID: {item.id.slice(0, 8)}...</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notes Detail Modal */}
      <NotesModal
        item={selectedNotesItem}
        onClose={() => setSelectedNotesItem(null)}
        onNotify={onNotify}
      />
    </div>
  );
};

