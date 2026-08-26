import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchBarProps {
  query: string;
  top: number;
  loading: boolean;
  onQueryChange: (q: string) => void;
  onTopChange: (top: number) => void;
  onSearch: () => void;
  onClear: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  top,
  loading,
  onQueryChange,
  onTopChange,
  onSearch,
  onClear,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div
      id="search-container"
      className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        {/* Input box */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="search-query-input"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search credentials (e.g., github, aws, work)..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-xs"
            aria-label="Search KeyPass entries"
          />
          {query && (
            <button
              type="button"
              id="btn-clear-search-query"
              onClick={onClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Top selector */}
        <div className="flex items-center gap-2 shrink-0">
          <label
            htmlFor="search-top-select"
            className="text-xs font-medium text-slate-600 whitespace-nowrap"
          >
            Limit:
          </label>
          <select
            id="search-top-select"
            value={top}
            onChange={(e) => onTopChange(Number(e.target.value))}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-xs"
            aria-label="Result limit top options"
          >
            <option value={5}>5 entries</option>
            <option value={10}>10 entries</option>
            <option value={20}>20 entries</option>
          </select>
        </div>

        {/* Search button */}
        <button
          type="submit"
          id="btn-execute-search"
          disabled={loading || !query.trim()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 text-white font-medium rounded-lg text-sm transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Search</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
