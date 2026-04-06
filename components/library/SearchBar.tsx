'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useLibraryStore } from '@/store/libraryStore';

export default function SearchBar() {
  const searchQuery = useLibraryStore((s) => s.searchQuery);
  const setSearch = useLibraryStore((s) => s.setSearch);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((value: string) => {
    setLocalQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearch(value);
    }, 300);
  }, [setSearch]);

  const handleClear = useCallback(() => {
    setLocalQuery('');
    setSearch('');
    inputRef.current?.focus();
  }, [setSearch]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: '400px',
    }}>
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          pointerEvents: 'none',
        }}
      />
      <input
        ref={inputRef}
        id="search-bar"
        type="text"
        value={localQuery}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search tracks, artists, albums..."
        style={{
          width: '100%',
          padding: '10px 36px 10px 38px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          background: 'var(--bg-glass)',
          color: 'var(--text-primary)',
          fontSize: '14px',
          outline: 'none',
          transition: 'border-color 0.2s, background 0.2s',
          backdropFilter: 'blur(8px)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--accent)';
          e.currentTarget.style.background = 'var(--bg-secondary)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.background = 'var(--bg-glass)';
        }}
      />
      {localQuery && (
        <button
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            borderRadius: '50%',
          }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
