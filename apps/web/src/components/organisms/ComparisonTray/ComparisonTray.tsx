import { FC, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComparisonStore } from '@/stores/comparisonStore';
import { Button } from '@admitly/ui';
import { GitCompare, X } from 'lucide-react';
import { mockPrograms, mockInstitutions } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import type { ComparisonTrayProps } from './types';

export const ComparisonTray: FC<ComparisonTrayProps> = ({
  className,
  onNavigateToCompare,
}) => {
  const navigate = useNavigate();
  const { items, removeItem } = useComparisonStore();

  // Fetch item details (same pattern as ComparePage)
  const comparisonData = useMemo(() => {
    return items.map((item) => {
      if (item.type === 'program') {
        const programData = mockPrograms.find((p) => p.id === item.id);
        return {
          ...item,
          name: programData?.name || 'Unknown Program',
          data: programData,
        };
      } else {
        const institutionData = mockInstitutions.find((i) => i.id === item.id);
        return {
          ...item,
          name: institutionData?.name || 'Unknown Institution',
          data: institutionData,
        };
      }
    });
  }, [items]);

  const handleViewComparison = () => {
    if (onNavigateToCompare) {
      onNavigateToCompare(items.map((item) => item.id));
    } else {
      navigate('/compare');
    }
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  // Don't render if no items
  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'shadow-lg',
        'transition-transform duration-300 ease-in-out',
        className
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          {/* Left side: Comparison icon + items */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-shrink-0">
              <GitCompare className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium hidden sm:inline">
                Compare ({items.length}/{comparisonData.length > 0 ? '3' : items.length})
              </span>
              <span className="text-sm font-medium sm:hidden">
                {items.length}
              </span>
            </div>

            {/* Item chips */}
            <div className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0 scrollbar-hide">
              {comparisonData.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium whitespace-nowrap flex-shrink-0"
                >
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">
                    {item.name}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="flex-shrink-0 hover:bg-secondary-foreground/10 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${item.name} from comparison`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right side: Action button */}
          <Button
            onClick={handleViewComparison}
            size="sm"
            className="flex-shrink-0"
          >
            <GitCompare className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">View Comparison</span>
            <span className="sm:hidden">Compare</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

ComparisonTray.displayName = 'ComparisonTray';
