import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Globe } from 'lucide-react';
import { COUNTRY_CODES, CountryCode } from '../data/countryCodes';

interface CountryCodeSelectorProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [customCode, setCustomCode] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = COUNTRY_CODES.find(c => c.code === value) || {
    code: value,
    iso: 'XX',
    name: 'Custom',
    flag: '🌐',
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filtered = COUNTRY_CODES.filter(c => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.includes(q) ||
      c.iso.toLowerCase().includes(q)
    );
  });

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearch('');
  };

  const handleApplyCustom = () => {
    let clean = customCode.trim();
    if (!clean.startsWith('+')) {
      clean = '+' + clean;
    }
    if (/^\+\d{1,5}$/.test(clean)) {
      onChange(clean);
      setIsOpen(false);
      setCustomCode('');
      setSearch('');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-1.5 h-11 px-3 rounded-xl bg-slate-950 border border-slate-700 hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-100 text-xs font-mono transition-colors cursor-pointer min-w-[100px]"
        aria-label="Select country dial code"
      >
        <span className="text-base leading-none">{selectedCountry.flag}</span>
        <span className="font-semibold text-cyan-300">{selectedCountry.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-72 max-w-[90vw] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search bar */}
          <div className="p-2 border-b border-slate-800 bg-slate-950">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search country or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-500 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/60 p-1 text-xs">
            {filtered.map((c, idx) => {
              const isSelected = c.code === value && c.name === selectedCountry.name;
              return (
                <button
                  key={`${c.iso}-${c.code}-${idx}`}
                  type="button"
                  onClick={() => handleSelect(c.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/80 text-cyan-300 font-semibold'
                      : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base shrink-0">{c.flag}</span>
                    <span className="truncate">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    <span className="font-mono text-[11px] text-slate-400">{c.code}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <div className="p-4 text-center text-slate-400 text-xs">
                No matching country found.
              </div>
            )}
          </div>

          {/* Custom Code Input Footer */}
          <div className="p-2 border-t border-slate-800 bg-slate-950/80 flex items-center gap-1.5 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Custom dial code (e.g. +355)"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              className="flex-1 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={handleApplyCustom}
              disabled={!customCode.trim()}
              className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono text-[11px] font-bold cursor-pointer"
            >
              Set
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
