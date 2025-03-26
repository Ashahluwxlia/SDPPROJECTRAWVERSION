import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';

export const useSearch = (callback: (term: string) => void, delay = 500) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, delay);

  useEffect(() => {
    if (debouncedSearch) {
      callback(debouncedSearch);
    }
  }, [debouncedSearch, callback]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  return {
    searchTerm,
    handleSearch,
    setSearchTerm
  };
};