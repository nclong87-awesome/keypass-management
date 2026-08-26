import React, { useState, useEffect } from 'react';
import { fetchOAuthToken, getApiBaseUrl } from '../api/client';
import { X, Settings as SettingsIcon, Shield, Key, Server, Loader2, CheckCircle, LogOut } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  currentToken: string;
  currentBaseUrl: string;
  onClose: () => void;
  onSaveToken: (token: string) => void;
  onSaveBaseUrl: (url: string) => void;
  onClearToken: () => void;
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  currentToken,
  currentBaseUrl,
  onClose,
  onSaveToken,
  onSaveBaseUrl,
  onClearToken,
  onNotify,
}) => {
  const [bearerInput, setBearerInput] = useState('');
  const [baseUrlInput, setBaseUrlInput] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [fetchingToken, setFetchingToken] = useState(false);
  const [oauthError, setOauthError] = useState('');
  const [activeTab, setActiveTab] = useState<'bearer' | 'oauth'>('bearer');

  useEffect(() => {
    if (isOpen) {
      setBearerInput(currentToken);
      setBaseUrlInput(currentBaseUrl || getApiBaseUrl());
      setOauthError('');
    }
  }, [isOpen, currentToken, currentBaseUrl]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !fetchingToken) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, fetchingToken, onClose]);

  if (!isOpen) return null;

  const handleSaveBearerToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bearerInput.trim()) {
      onNotify('Please enter a valid Bearer token.', 'error');
      return;
    }
    onSaveToken(bearerInput.trim());
    onSaveBaseUrl(baseUrlInput.trim());
    onNotify('Authorization token updated in memory!', 'success');
    onClose();
  };

  const handleFetchOAuthToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim() || !clientSecret.trim()) {
      setOauthError('Both Client ID and Client Secret are required.');
      return;
    }

    setOauthError('');
    setFetchingToken(true);

    try {
      const targetBaseUrl = baseUrlInput.trim() || getApiBaseUrl();
      const res = await fetchOAuthToken(
        clientId.trim(),
        clientSecret.trim(),
        targetBaseUrl
      );
      if (res.access_token) {
        onSaveToken(res.access_token);
        onSaveBaseUrl(targetBaseUrl);
        setClientSecret(''); // Clear secret from form memory immediately
        onNotify('Successfully obtained OAuth Bearer token!', 'success');
        onClose();
      } else {
        setOauthError('No access token received from server.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve OAuth token.';
      setOauthError(msg);
    } finally {
      setFetchingToken(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-lg w-full overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2 text-indigo-600">
            <SettingsIcon className="w-5 h-5" />
            <h2 id="settings-modal-title" className="text-lg font-semibold text-slate-900">
              Settings & Authentication
            </h2>
          </div>
          <button
            type="button"
            id="btn-close-settings-modal"
            onClick={onClose}
            disabled={fetchingToken}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* API Base URL configuration */}
          <div>
            <label
              htmlFor="settings-base-url-input"
              className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1.5"
            >
              <Server className="w-3.5 h-3.5 text-indigo-600" />
              <span>Backend API Base URL</span>
            </label>
            <input
              type="text"
              id="settings-base-url-input"
              value={baseUrlInput}
              onChange={(e) => setBaseUrlInput(e.target.value)}
              placeholder="http://localhost:5204"
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Default: <code className="text-slate-700 font-semibold bg-slate-100 px-1 py-0.5 rounded">VITE_API_BASE_URL</code> (HTTP: 5204 / HTTPS: 7044)
            </p>
          </div>

          {/* Current Auth Status indicator */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Shield className={`w-5 h-5 ${currentToken ? 'text-emerald-600' : 'text-amber-600'}`} />
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  {currentToken ? 'Authorization Token Active' : 'No Token Configured'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {currentToken ? 'Token held in volatile memory' : 'API requests will return 401 Unauthorized'}
                </p>
              </div>
            </div>
            {currentToken && (
              <button
                type="button"
                id="btn-clear-auth-token"
                onClick={() => {
                  onClearToken();
                  setBearerInput('');
                  onNotify('Authorization token cleared.', 'info');
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-medium transition-colors shadow-xs"
                title="Clear token from memory"
              >
                <LogOut className="w-3 h-3" />
                <span>Clear Token</span>
              </button>
            )}
          </div>

          {/* Auth Method Tabs */}
          <div className="border-b border-slate-200 flex gap-4">
            <button
              type="button"
              id="tab-bearer-token"
              onClick={() => setActiveTab('bearer')}
              className={`pb-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'bearer'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Paste Bearer Token
            </button>
            <button
              type="button"
              id="tab-oauth-client"
              onClick={() => setActiveTab('oauth')}
              className={`pb-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'oauth'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Fetch via Client Credentials
            </button>
          </div>

          {/* Tab 1: Direct Bearer Token */}
          {activeTab === 'bearer' && (
            <form onSubmit={handleSaveBearerToken} className="space-y-4">
              <div>
                <label
                  htmlFor="settings-bearer-input"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Bearer Token
                </label>
                <textarea
                  id="settings-bearer-input"
                  rows={3}
                  value={bearerInput}
                  onChange={(e) => setBearerInput(e.target.value)}
                  placeholder="Paste your Bearer token here..."
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  id="btn-save-bearer-token"
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-xs"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Save Token</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Client Credentials Grant */}
          {activeTab === 'oauth' && (
            <form onSubmit={handleFetchOAuthToken} className="space-y-4">
              {oauthError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {oauthError}
                </div>
              )}

              <p className="text-xs text-slate-500">
                Obtains a token via <code className="text-slate-800 font-semibold bg-slate-100 px-1 py-0.5 rounded">POST /oauth/token</code>. Secrets are not saved or committed.
              </p>

              <div>
                <label
                  htmlFor="oauth-client-id"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Client ID
                </label>
                <input
                  type="text"
                  id="oauth-client-id"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="e.g. keypass-client-123"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="oauth-client-secret"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Client Secret
                </label>
                <input
                  type="password"
                  id="oauth-client-secret"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="Enter secret (kept in temporary memory)"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  id="btn-fetch-oauth-token"
                  disabled={fetchingToken}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 text-white rounded-lg text-sm font-medium transition-colors shadow-xs"
                >
                  {fetchingToken ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Requesting Token...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Request Access Token</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
