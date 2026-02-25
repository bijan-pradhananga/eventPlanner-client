import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarDays, MapPin, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EventStatusBadge from './EventStatusBadge';
import TagBadge from './TagBadge';
import type { Event } from '@/types';

interface EventCardProps {
  event: Event;
  showActions?: boolean;
  onDelete?: (id: number) => void;
}

const fallbackImages = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=70',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=70',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=70',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=70',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=70',
];

function getImageForEvent(id: number) {
  return fallbackImages[id % fallbackImages.length];
}

export default function EventCard({ event, showActions = false, onDelete }: EventCardProps) {
  const navigate = useNavigate();

  const isPast = new Date(event.event_date) < new Date();
  const status = isPast ? 'past' : 'upcoming';

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md transition-all group p-0 border-border"
      onClick={() => navigate(`/events/${event.id}`)}
    >
      {/* Cover Image */}
      <div className="relative w-full h-44 overflow-hidden">
        <img
          src={event.cover_image ?? getImageForEvent(event.id)}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
        <div className="absolute top-3 left-3">
          <EventStatusBadge status={status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
            {event.title}
          </h3>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded hover:bg-gray-100 text-muted-foreground shrink-0"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/events/${event.id}/edit`);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(event.id);
                  }}
                  className="text-red-500 focus:text-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="mt-2.5 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="w-3.5 h-3.5 shrink-0" />
            <span>
              {format(new Date(event.event_date), 'MMM d, yyyy')} •{' '}
              {format(new Date(event.event_date), 'h:mm a')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {event.tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
