import React, { useState, useCallback } from 'react';
import { KeyPass, CreateKeyPassRequest, UpdateKeyPassRequest, ToastMessage } from './types';
import {
  searchKeyPassEntries,
  createKeyPassEntry,
  updateKeyPassEntry,
  deleteKeyPassEntry,
  getApiBaseUrl,
  ApiError,
} from './api/client';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ResultsView } from './components/ResultsView';
import { AddKeyPassModal } from './components/AddKeyPassModal';
import { EditKeyPassModal } from './components/EditKeyPassModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer } from './components/ToastContainer';
import {
  ShieldAlert,
  SearchX,
  KeyRound,
  AlertTriangle,
  Server,
  Sparkles,
  Info,
} from 'lucide-react';

export default function App() {
  // In-memory Authentication and Config State
  const [token, setToken] = useState<string>('');
  const [baseUrl, setBaseUrl] = useState<string>(getApiBaseUrl());

  // Search State
  const [query, setQuery] = useState<string>('');
  const [top, setTop] = useState<number>(5);
  const [items, setItems] = useState<KeyPass[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Security: Per-row revealed password IDs state (Cleared on refresh/delete/logout)
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  // Modals & Dialog State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<KeyPass | null>(null);
  const [deletingItem, setDeletingItem] = useState<KeyPass | null>(null);

  // Operation loading states
  const [addLoading, setAddLoading] = useState<boolean>(false);
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Toast Notification State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Password Reveal Toggle Handler
  const handleToggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Search Action
  const handleSearch = async (overrideQuery?: string, overrideTop?: number) => {
    const q = overrideQuery !== undefined ? overrideQuery : query;
    const limit = overrideTop !== undefined ? overrideTop : top;

    if (!q.trim()) {
      addToast('Please enter a search query.', 'info');
      return;
    }

    if (!token) {
      setSearchError('Authorization token required to search entries.');
      setIsSettingsOpen(true);
      return;
    }

    setLoading(true);
    setSearchError(null);
    setRevealedIds(new Set()); // Security: Clear revealed password state on search refresh

    try {
      const results = await searchKeyPassEntries(q, limit, token, baseUrl);
      setItems(results);
      setHasSearched(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setSearchError(err.message);
        addToast(err.message, 'error');
        if (err.status === 401 || err.status === 403) {
          setIsSettingsOpen(true);
        }
      } else if (err instanceof Error) {
        setSearchError(err.message);
        addToast(err.message, 'error');
      } else {
        setSearchError('An unknown error occurred while searching.');
        addToast('An unknown error occurred while searching.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setQuery('');
    setItems([]);
    setHasSearched(false);
    setSearchError(null);
    setRevealedIds(new Set());
  };

  // Create KeyPass Action
  const handleCreateSubmit = async (data: CreateKeyPassRequest) => {
    if (!token) {
      addToast('Authorization token required.', 'error');
      setIsSettingsOpen(true);
      return;
    }

    setAddLoading(true);

    try {
      const created = await createKeyPassEntry(data, token, baseUrl);
      addToast(`Created KeyPass entry for "${created.title}"`, 'success');
      setRevealedIds(new Set());

      // Prepend to current list or refresh search
      if (query.trim()) {
        await handleSearch();
      } else {
        setItems((prev) => [created, ...prev]);
        setHasSearched(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create entry.';
      addToast(msg, 'error');
      throw err;
    } finally {
      setAddLoading(false);
    }
  };

  // Edit KeyPass Action
  const handleEditSubmit = async (id: string, data: UpdateKeyPassRequest) => {
    if (!token) {
      addToast('Authorization token required.', 'error');
      setIsSettingsOpen(true);
      return;
    }

    setEditLoading(true);

    try {
      const updated = await updateKeyPassEntry(id, data, token, baseUrl);
      addToast(`Updated KeyPass entry for "${updated.title}"`, 'success');

      // Update in local results list
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));

      // Security: Clear reveal state for this item
      setRevealedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update entry.';
      addToast(msg, 'error');
      throw err;
    } finally {
      setEditLoading(false);
    }
  };

  // Delete KeyPass Action
  const handleDeleteConfirm = async (id: string) => {
    if (!token) {
      addToast('Authorization token required.', 'error');
      setIsSettingsOpen(true);
      return;
    }

    setDeleteLoading(true);

    try {
      await deleteKeyPassEntry(id, token, baseUrl);
      const title = deletingItem?.title || 'Entry';
      addToast(`Deleted KeyPass entry for "${title}"`, 'success');

      // HTTP 204 Success: Remove item immediately from search results
      setItems((prev) => prev.filter((item) => item.id !== id));

      // Security: Clear revealed state
      setRevealedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      setDeletingItem(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete entry.';
      addToast(msg, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Clear Token / Logout
  const handleClearToken = () => {
    setToken('');
    setRevealedIds(new Set());
    setItems([]);
    setHasSearched(false);
    setSearchError(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        isAuthenticated={Boolean(token)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAddModal={() => {
          if (!token) {
            addToast('Please configure a Bearer token first.', 'info');
            setIsSettingsOpen(true);
          } else {
            setIsAddOpen(true);
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Search & Limit Control Bar */}
        <SearchBar
          query={query}
          top={top}
          loading={loading}
          onQueryChange={setQuery}
          onTopChange={(newTop) => {
            setTop(newTop);
            if (query.trim() && token) {
              handleSearch(query, newTop);
            }
          }}
          onSearch={() => handleSearch()}
          onClear={handleClearSearch}
        />

        {/* Unauthenticated / Prompt State */}
        {!token && (
          <div
            id="auth-prompt-card"
            className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 text-center max-w-xl mx-auto space-y-4 shadow-sm"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Authorization Token Required
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
                All KeyPass endpoints require a valid Bearer token. Paste an existing token or obtain one via Client Credentials in Settings.
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                id="btn-open-settings-prompt"
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
              >
                <Server className="w-4 h-4" />
                <span>Configure Token & Settings</span>
              </button>
            </div>
          </div>
        )}

        {/* Error State Banner */}
        {token && searchError && (
          <div
            id="search-error-banner"
            className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 shadow-xs"
          >
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-rose-900">API Error Encountered</p>
              <p className="mt-0.5 text-rose-700">{searchError}</p>
            </div>
            <button
              type="button"
              id="btn-retry-search"
              onClick={() => handleSearch()}
              className="px-3 py-1 bg-white hover:bg-rose-100 text-rose-700 rounded text-xs font-medium border border-rose-300 transition-colors shadow-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* Initial Empty Search State */}
        {token && !loading && !hasSearched && !searchError && (
          <div
            id="initial-empty-state"
            className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center max-w-md mx-auto space-y-3 shadow-xs"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Semantic Vault Search
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter a search query above to query KeyPass entries using semantic similarity. Results match concept terms like <code className="text-indigo-600 font-semibold bg-indigo-50 px-1 py-0.5 rounded">github</code>, <code className="text-indigo-600 font-semibold bg-indigo-50 px-1 py-0.5 rounded">email</code>, or <code className="text-indigo-600 font-semibold bg-indigo-50 px-1 py-0.5 rounded">cloud</code>.
            </p>
          </div>
        )}

        {/* No Results Found State */}
        {token && !loading && hasSearched && items.length === 0 && !searchError && (
          <div
            id="no-results-state"
            className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-md mx-auto space-y-3 shadow-xs"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mx-auto">
              <SearchX className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No matching KeyPass entries found
            </h3>
            <p className="text-xs text-slate-600">
              No entries matched your query <span className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">"{query}"</span>. Try a different query or add a new entry.
            </p>
          </div>
        )}

        {/* Results List Component */}
        {token && items.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <span>
                Found <strong className="text-slate-900 font-semibold">{items.length}</strong> {items.length === 1 ? 'entry' : 'entries'}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-500">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                Passwords masked as •••••••••••• by default
              </span>
            </div>

            <ResultsView
              items={items}
              revealedIds={revealedIds}
              onToggleReveal={handleToggleReveal}
              onEdit={(item) => setEditingItem(item)}
              onDelete={(item) => setDeletingItem(item)}
              onNotify={addToast}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-4 mt-8 bg-white text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono">
          <span>KeyPass Manager • Real Backend API Integration</span>
          <span>Target: {baseUrl}</span>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <SettingsModal
        isOpen={isSettingsOpen}
        currentToken={token}
        currentBaseUrl={baseUrl}
        onClose={() => setIsSettingsOpen(false)}
        onSaveToken={(t) => setToken(t)}
        onSaveBaseUrl={(url) => setBaseUrl(url)}
        onClearToken={handleClearToken}
        onNotify={addToast}
      />

      <AddKeyPassModal
        isOpen={isAddOpen}
        loading={addLoading}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleCreateSubmit}
        onNotify={addToast}
      />

      <EditKeyPassModal
        item={editingItem}
        loading={editLoading}
        onClose={() => setEditingItem(null)}
        onSubmit={handleEditSubmit}
        onNotify={addToast}
      />

      <DeleteConfirmModal
        item={deletingItem}
        loading={deleteLoading}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
