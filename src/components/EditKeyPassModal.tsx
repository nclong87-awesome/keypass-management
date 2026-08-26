import React, { useState, useEffect } from 'react';
import { KeyPass, UpdateKeyPassRequest } from '../types';
import { generateSecurePassword } from '../utils/passwordGenerator';
import { X, Edit2, Eye, EyeOff, Wand2, Loader2 } from 'lucide-react';

interface EditKeyPassModalProps {
  item: KeyPass | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: UpdateKeyPassRequest) => Promise<void>;
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const EditKeyPassModal: React.FC<EditKeyPassModalProps> = ({
  item,
  loading,
  onClose,
  onSubmit,
  onNotify,
}) => {
  const [group, setGroup] = useState('');
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Pre-fill existing fields when item changes (password is NOT pre-filled!)
  useEffect(() => {
    if (item) {
      setGroup(item.group || '');
      setTitle(item.title || '');
      setUsername(item.username || '');
      setNewPassword(''); // Never prefill password!
      setUrl(item.url || '');
      setNotes(item.notes || '');
      setShowPassword(false);
      setValidationError('');
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

  const handleGeneratePassword = () => {
    const generated = generateSecurePassword(18);
    setNewPassword(generated);
    setShowPassword(true);
    onNotify('Generated new secure random password', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError('Title cannot be empty.');
      return;
    }

    setValidationError('');

    const payload: UpdateKeyPassRequest = {
      group: group.trim(),
      title: title.trim(),
      username: username.trim(),
      url: url.trim(),
      notes: notes.trim(),
    };

    // Only include password if non-empty string entered
    if (newPassword.trim()) {
      payload.password = newPassword;
    }

    try {
      await onSubmit(item.id, payload);
      setNewPassword('');
      onClose();
    } catch {
      // Error handled by parent
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-lg w-full overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2 text-indigo-600">
            <Edit2 className="w-5 h-5" />
            <h2 id="edit-modal-title" className="text-lg font-semibold text-slate-900">
              Edit KeyPass Entry
            </h2>
          </div>
          <button
            type="button"
            id="btn-close-edit-modal"
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {validationError}
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="edit-title-input"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="edit-title-input"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError('');
              }}
              required
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
            />
          </div>

          {/* Group & Username Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="edit-group-input"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Group
              </label>
              <input
                type="text"
                id="edit-group-input"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
              />
            </div>
            <div>
              <label
                htmlFor="edit-username-input"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Username
              </label>
              <input
                type="text"
                id="edit-username-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono shadow-xs"
              />
            </div>
          </div>

          {/* Password field with specified label: New password (optional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="edit-password-input"
                className="block text-xs font-medium text-slate-700"
              >
                New password (optional)
              </label>
              <button
                type="button"
                id="btn-generate-password-edit"
                onClick={handleGeneratePassword}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Generate New</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="edit-password-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to preserve existing password"
                className="w-full pl-3.5 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono shadow-xs"
              />
              <button
                type="button"
                id="btn-toggle-password-edit"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Leave blank to keep current password unchanged.
            </p>
          </div>

          {/* URL */}
          <div>
            <label
              htmlFor="edit-url-input"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              URL
            </label>
            <input
              type="url"
              id="edit-url-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
            />
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="edit-notes-input"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Notes
            </label>
            <textarea
              id="edit-notes-input"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              id="btn-cancel-edit-modal"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-edit-entry"
              disabled={loading || !title.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  <span>Update Entry</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
