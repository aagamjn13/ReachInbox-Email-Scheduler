import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Filter, Send } from 'lucide-react';
import { useSentEmails, useSearchEmails } from '../../hooks/useEmails';
import EmailRow from '../../components/ui/EmailRow';
import SearchInput from '../../components/ui/SearchInput';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

const SentPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const { 
    data: sentData, 
    isLoading: isLoadingSent, 
    refetch 
  } = useSentEmails(page, 20);

  const { 
    data: searchData, 
    isLoading: isLoadingSearch 
  } = useSearchEmails(searchQuery, page, 20);

  const isSearching = searchQuery.length > 2;
  const data = isSearching ? searchData : sentData;
  const isLoading = isSearching ? isLoadingSearch : isLoadingSent;

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Top Bar */}
      <div className="flex items-center border-b border-gray-100 bg-white px-8 py-4">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-6">
          <div className="relative flex-1">
            <SearchInput 
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Filter className="h-4 w-4" />
          </button>
          <button 
            onClick={() => refetch()}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <LoadingState />
        ) : !data || data.data.length === 0 ? (
          <div className="p-8 h-full">
            <EmptyState 
              icon={Send} 
              title="No sent emails" 
              description={isSearching ? "No emails match your search." : "You haven't sent any emails yet."}
              action={!isSearching && (
                <Button onClick={() => navigate('/compose')}>
                  Compose an Email
                </Button>
              )}
            />
          </div>
        ) : (
          <div>
            {data.data.map((email) => (
              <EmailRow 
                key={email.id} 
                email={email} 
                onClick={(e) => navigate(`/emails/${e.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{(page - 1) * 20 + 1}</span> to <span className="font-medium">{Math.min(page * 20, data.total)}</span> of <span className="font-medium">{data.total}</span> results
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === data.totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentPage;
