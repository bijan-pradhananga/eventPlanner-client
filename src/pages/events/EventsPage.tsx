import { useEffect, useCallback } from 'react';
import { X, Plus } from 'lucide-react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import EventCard from '@/components/shared/EventCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import PaginationControls from '@/components/shared/PaginationControls';
import TagBadge from '@/components/shared/TagBadge';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchEvents, setFilters } from '@/store/eventsSlice';
import { fetchAllTags } from '@/store/tagsSlice';
import type { EventType } from '@/types';

// Main Events Page
export default function EventsPage() {
  const dispatch = useAppDispatch();

  const { events, pagination, filters, isLoading } = useAppSelector((s) => s.events);
  const { tags } = useAppSelector((s) => s.tags);

  const loadEvents = useCallback(() => {
    dispatch(fetchEvents(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    dispatch(fetchAllTags());
  }, [dispatch]);

  const currentTab = filters.upcoming
    ? 'upcoming'
    : filters.past
      ? 'past'
      : 'all';

  const hasActiveFilters =
    (filters.tag_ids?.length ?? 0) > 0 ||
    !!filters.event_type ||
    !!filters.search;

  const handleTabChange = (value: string) => {
    dispatch(
      setFilters({
        upcoming: value === 'upcoming' ? true : undefined,
        past: value === 'past' ? true : undefined,
        page: 1,
      })
    );
  };

  const handleTypeFilter = (value: string) => {
    dispatch(setFilters({ event_type: value === 'all' ? '' : (value as EventType), page: 1 }));
  };

  const handleTagToggle = (tagId: number) => {
    const current = filters.tag_ids ?? [];
    const updated = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    dispatch(setFilters({ tag_ids: updated, page: 1 }));
  };

  const handleClearTag = (tagId: number) => {
    const updated = (filters.tag_ids ?? []).filter((id) => id !== tagId);
    dispatch(setFilters({ tag_ids: updated, page: 1 }));
  };

  const handleClearAllFilters = () => {
    dispatch(setFilters({ tag_ids: [], event_type: '', search: '', page: 1 }));
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <FilterTabs currentTab={currentTab} onTabChange={handleTabChange} />

          <div className="flex items-center gap-2 flex-wrap">
            <EventTypeFilter
              value={filters.event_type || 'all'}
              onChange={handleTypeFilter}
            />

            <ActiveTagFilters
              tagIds={filters.tag_ids ?? []}
              tags={tags}
              onClearTag={handleClearTag}
              onClearAll={handleClearAllFilters}
              hasOtherFilters={!!filters.event_type || !!filters.search}
            />
          </div>
        </div>

        <PopularTags
          tags={tags}
          selectedTagIds={filters.tag_ids ?? []}
          onToggleTag={handleTagToggle}
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : events.length === 0 ? (
        <EmptyState
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearAllFilters}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          <PaginationControls
            pagination={pagination}
            onPageChange={(page) => dispatch(setFilters({ page }))}
          />
        </>
      )}
    </div>
  );
}

// Sub-components
function PageHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">All Events</h1>
    </div>
  );
}

interface FilterTabsProps {
  currentTab: 'upcoming' | 'past' | 'all';
  onTabChange: (value: string) => void;
}

function FilterTabs({ currentTab, onTabChange }: FilterTabsProps) {
  return (
    <Tabs value={currentTab} onValueChange={onTabChange}>
      <TabsList className="h-9">
        <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
        <TabsTrigger value="past">Past Events</TabsTrigger>
        <TabsTrigger value="all">All</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

interface EventTypeFilterProps {
  value: string;
  onChange: (value: string) => void;
}

function EventTypeFilter({ value, onChange }: EventTypeFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 text-xs w-32 bg-white">
        <SelectValue placeholder="Type: All" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Type: All</SelectItem>
        <SelectItem value="public">Public</SelectItem>
        <SelectItem value="private">Private</SelectItem>
      </SelectContent>
    </Select>
  );
}

interface ActiveTagFiltersProps {
  tagIds: number[];
  tags: Array<{ id: number; name: string }>;
  onClearTag: (id: number) => void;
  onClearAll: () => void;
  hasOtherFilters: boolean;
}

function ActiveTagFilters({
  tagIds,
  tags,
  onClearTag,
  onClearAll,
  hasOtherFilters,
}: ActiveTagFiltersProps) {
  if (tagIds.length === 0) return null;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-xs text-muted-foreground font-medium">TAGS:</span>
      {tagIds.map((id) => {
        const tag = tags.find((t) => t.id === id);
        if (!tag) return null;
        return (
          <button
            key={id}
            onClick={() => onClearTag(id)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
          >
            #{tag.name}
            <X className="w-3 h-3" />
          </button>
        );
      })}
      {hasOtherFilters && (
        <button
          onClick={onClearAll}
          className="text-xs text-muted-foreground hover:text-gray-700 ml-1 underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

interface PopularTagsProps {
  tags: Array<{ id: number; name: string }>;
  selectedTagIds: number[];
  onToggleTag: (id: number) => void;
}

function PopularTags({ tags, selectedTagIds, onToggleTag }: PopularTagsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground font-medium">Filter by tag:</span>
      {tags.slice(0, 12).map((tag) => (
        <TagBadge
          key={tag.id}
          tag={tag}
          selected={selectedTagIds.includes(tag.id)}
          onClick={() => onToggleTag(tag.id)}
        />
      ))}
    </div>
  );
}

interface EmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

function EmptyState({ hasActiveFilters, onClearFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Plus className="w-8 h-8 text-primary" />
      </div>
      <div className="text-center">
        <p className="text-gray-900 font-semibold">No events found</p>
        <p className="text-muted-foreground text-sm mt-1">
          {hasActiveFilters ? 'Try adjusting your filters.' : 'Be the first to create one!'}
        </p>
      </div>
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}

