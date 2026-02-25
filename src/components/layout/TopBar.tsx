import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Plus, Search, CalendarCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSearchFilters, searchEvents, clearSearchFilters } from '@/store/eventsSlice';
import LoadingSpinner from '../shared/LoadingSpinner';

// Main TopBar Component
export default function TopBar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const { searchResults, isSearching } = useAppSelector((s) => s.events);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setShowResults(false);
      dispatch(clearSearchFilters());
      return;
    }

    const timeoutId = setTimeout(() => {
      dispatch(setSearchFilters({ search: searchQuery, page: 1 }));
      dispatch(searchEvents({ search: searchQuery, page: 1, limit: 5 }));
      setShowResults(true);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, dispatch]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowResults(false);
    dispatch(clearSearchFilters());
  };

  const handleEventClick = (eventId: number) => {
    setShowResults(false);
    setSearchQuery('');
    navigate(`/events/${eventId}`);
  };

  return (
    <header className="h-14 flex items-center gap-3 px-4 md:px-6 bg-white border-b border-border shrink-0 relative z-50">
      <SearchInput
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onClear={handleClearSearch}
      />

      <SearchResults
        show={showResults}
        isSearching={isSearching}
        results={searchResults}
        query={searchQuery}
        onEventClick={handleEventClick}
      />

      <MobileLogo />
      <div className="flex items-center gap-2 ml-auto">
        <CreateEventButton onClick={() => navigate('/events/create')} />
      </div>
    </header>
  );
}

// Search Input
function SearchInput({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

      <Input
        placeholder="Search events..."
        className="pl-9 pr-8 h-9 bg-[#f1f5f9] border-0 text-sm"
        value={value}
        onChange={onChange}
      />

      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Search Results Dropdown
interface SearchResultsProps {
  show: boolean;
  isSearching: boolean;
  results: any[]; // ← replace with proper Event type
  query: string;
  onEventClick: (eventId: number) => void;
}

function SearchResults({
  show,
  isSearching,
  results,
  query,
  onEventClick,
}: SearchResultsProps) {
  if (!show || !query.trim()) return null;

  return (
    <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="p-4">
        {isSearching ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
            <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Search Results ({results.length})</h3>
            </div>

            {results.map((event) => (
              <div
                key={event.id}
                onClick={() => onEventClick(event.id)}
                className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{event.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{event.location}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.event_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No events found for "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Mobile Logo
function MobileLogo() {
  return (
    <div className="flex items-center gap-2 md:hidden shrink-0">
      <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
        <CalendarCheck className="w-4 h-4 text-white" />
      </div>
    </div>
  );
}

// Create Event Button
function CreateEventButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      className="font-semibold md:flex rounded-md w-7 h-7 md:w-auto md:h-auto p-0 md:p-2 flex items-center justify-center"
    >
      <Plus className="w-4 h-4 md:w-4 md:h-4" />
      <span className="hidden md:inline ml-1">Create Event</span>
    </Button>
  );
}

