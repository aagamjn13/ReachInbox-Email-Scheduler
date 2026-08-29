import React from 'react';
import { Search } from 'lucide-react';
import Input from './Input';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const SearchInput: React.FC<SearchInputProps> = (props) => {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full rounded-full border-none bg-[#f4f4f5] py-2 pl-10 pr-4 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder:text-gray-400"
        {...props}
      />
    </div>
  );
};

export default SearchInput;
