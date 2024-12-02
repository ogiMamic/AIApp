import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchResult {
  id: string;
  name: string;
  type: 'folder' | 'file';
}

interface SearchInputProps {
  items: any[];
  onSelect: (item: SearchResult) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ items, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchItems = (items: any[], term: string): SearchResult[] => {
    let results: SearchResult[] = [];
    for (const item of items) {
      if (item.name.toLowerCase().includes(term.toLowerCase())) {
        results.push({ id: item.id, name: item.name, type: item.children ? 'folder' : 'file' });
      }
      if (item.children) {
        results = results.concat(searchItems(item.children, term));
      }
    }
    return results;
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.length > 0) {
      const searchResults = searchItems(items, term);
      setResults(searchResults);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    onSelect(result);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        type="text"
        placeholder="Search folders and files..."
        value={searchTerm}
        onChange={handleSearch}
      />
      {isOpen && results.length > 0 && (
        <ScrollArea className="absolute z-10 w-full max-h-60 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          {results.map((result) => (
            <div
              key={result.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectResult(result)}
            >
              {result.name} ({result.type})
            </div>
          ))}
        </ScrollArea>
      )}
    </div>
  );
};

export default SearchInput;

