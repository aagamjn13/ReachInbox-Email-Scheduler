import React, { useState } from 'react';
import { format } from 'date-fns';
import { Clock, Star } from 'lucide-react';
import { Email } from '../../types';

interface EmailRowProps {
  email: Email;
  onClick: (email: Email) => void;
}

const EmailRow: React.FC<EmailRowProps> = ({ email, onClick }) => {
  const [isStarred, setIsStarred] = useState(false);

  const displayDate = email.sentAt 
    ? new Date(email.sentAt) 
    : new Date(email.scheduledAt);

  const isScheduled = email.status === 'SCHEDULED' || email.status === 'RATE_LIMITED';
  
  // Extract text snippet from HTML body
  const bodySnippet = (email.body || '').replace(/<[^>]+>/g, '').trim().substring(0, 80);

  return (
    <div 
      onClick={() => onClick(email)}
      className="flex cursor-pointer items-center border-b border-gray-100 bg-white px-8 py-3.5 transition-colors hover:bg-gray-50"
    >
      <div className="w-[30%] truncate pr-4">
        <span className="text-sm font-medium text-gray-900">
          To: {email.recipient}
        </span>
      </div>
      
      <div className="flex flex-1 items-center gap-3 truncate pr-8">
        {/* Status Pill */}
        {email.status === 'RATE_LIMITED' ? (
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-[11px] font-medium tracking-wide text-red-600" title="Rate limit reached. Paused for 1 hour.">
            <Clock className="h-3 w-3" />
            Rate Limited
          </div>
        ) : isScheduled ? (
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-[11px] font-medium tracking-wide text-orange-600">
            <Clock className="h-3 w-3" />
            {format(displayDate, 'EEE h:mm:ss a')}
          </div>
        ) : (
          <div className="flex shrink-0 items-center rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium tracking-wide text-gray-600">
            Sent
          </div>
        )}
        
        {/* Subject and Snippet */}
        <div className="truncate">
          <span className="text-sm font-semibold text-gray-900">{email.subject || '(No subject)'}</span>
          <span className="text-sm text-gray-400"> - {bodySnippet}...</span>
        </div>
      </div>
      
      <div 
        className="flex items-center shrink-0 p-1" 
        onClick={(e) => {
          e.stopPropagation();
          setIsStarred(!isStarred);
        }}
      >
        <Star 
          className={`h-4 w-4 transition-colors ${
            isStarred 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'fill-transparent text-gray-300 hover:text-gray-400'
          }`} 
        />
      </div>
    </div>
  );
};

export default EmailRow;
