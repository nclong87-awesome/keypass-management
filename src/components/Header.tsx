import React from 'react';
import { KeyRound, Plus, Settings, ShieldCheck, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  isAuthenticated: boolean;
  onOpenSettings: () => void;
  onOpenAddModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAuthenticated,
  onOpenSettings,
  onOpenAddModal,
}) => {
  return (
    <header
      id="header-bar"
      className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 h-16 flex items-center justify-between gap-4">
        {/* Logo and App Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
              KeyPass Manager
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure Semantic Vault
            </p>
          </div>
        </div>

        {/* Status Badge & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Indicator */}
          <div
            id="auth-status-badge"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              isAuthenticated
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {isAuthenticated ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Authorized</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Token Required</span>
              </>
            )}
          </div>

          {/* Add Entry Button */}
          <button
            type="button"
            id="btn-open-add-modal"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            id="btn-open-settings-modal"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            aria-label="Settings and Authentication"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
