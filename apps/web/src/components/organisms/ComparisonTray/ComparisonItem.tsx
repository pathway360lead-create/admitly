import { FC } from 'react';
import { X } from 'lucide-react';
import { useComparisonItem } from '@/hooks/useComparisonItem';
import { useComparisonStore } from '@/stores/comparisonStore';
import { Badge } from '@admitly/ui';

interface ComparisonItemProps {
  id: string;
  type: 'program' | 'institution';
}

export const ComparisonItem: FC<ComparisonItemProps> = ({ id, type }) => {
  const { data, isLoading } = useComparisonItem(id, type);
  const { removeItem } = useComparisonStore();

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeItem(id);
  };

  if (isLoading) {
    return (
      <Badge variant="secondary" className="animate-pulse">
        Loading...
      </Badge>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Badge variant="secondary" className="flex items-center gap-2">
      <span>{data.name}</span>
      <button onClick={handleRemove} className="rounded-full hover:bg-muted-foreground/20">
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
};
