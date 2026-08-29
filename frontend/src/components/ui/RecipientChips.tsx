import React from 'react';
import { X } from 'lucide-react';

interface RecipientChipsProps {
  recipients: string[];
  onRemove: (index: number) => void;
}

const RecipientChips: React.FC<RecipientChipsProps> = ({ recipients, onRemove }) => {
  if (recipients.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 py-2">
      {recipients.map((email, index) => (
        <span 
          key={`${email}-${index}`} 
          className="flex items-center gap-1 rounded-full border border-green-600 bg-green-50 px-3 py-1 text-xs text-gray-900 font-medium"
        >
          {email}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="ml-1 rounded-full text-green-600 hover:bg-green-200 focus:outline-none"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
};

export default RecipientChips;
