/**
 * SearchBox component - universal search input with regex toggle and debounce.
 */

import { useState, useEffect, useRef } from 'react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  isRegex: boolean;
  onRegexToggle: () => void;
  error: string | null;
  placeholder?: string;
  debounceMs?: number;
}

export default function SearchBox({
  value,
  onChange,
  isRegex,
  onRegexToggle,
  error,
  placeholder = 'Search all fields...',
  debounceMs = 300,
}: SearchBoxProps) {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimer = useRef<number | null>(null);

  // Sync local value with parent value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new debounce timer
    debounceTimer.current = window.setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  };

  // Clear search
  const handleClear = () => {
    setLocalValue('');
    onChange('');
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <input
          type="text"
          className={`search-input ${error ? 'error' : ''}`}
          value={localValue}
          onChange={handleInputChange}
          placeholder={placeholder}
        />
        {localValue && (
          <button
            type="button"
            className="search-clear"
            onClick={handleClear}
            title="Clear search"
          >
            &times;
          </button>
        )}
      </div>
      <button
        type="button"
        className={`regex-toggle ${isRegex ? 'active' : ''}`}
        onClick={onRegexToggle}
        title={isRegex ? 'Regex mode enabled' : 'Enable regex mode'}
      >
        .*
      </button>
      {error && <div className="search-error">{error}</div>}
    </div>
  );
}
