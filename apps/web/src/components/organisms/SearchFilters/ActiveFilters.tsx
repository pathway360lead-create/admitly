import { FC } from 'react';
import { Badge, Button } from '@admitly/ui';
import { X } from 'lucide-react';
import { useSearchFilterStore } from '@/stores/searchFilterStore';
import { FilterState } from '@/stores/searchFilterStore';

interface ActiveFiltersProps {
    className?: string;
}

export const ActiveFilters: FC<ActiveFiltersProps> = ({ className = '' }) => {
    const { filters, clearFilter, clearAllFilters, hasActiveFilters } = useSearchFilterStore();

    if (!hasActiveFilters()) {
        return null;
    }

    const formatLabel = (key: keyof FilterState, value: any): string => {
        if (key === 'state') return `State: ${value}`;
        if (key === 'search') return `Search: ${value}`;
        if (key === 'verified' && value) return 'Verified Only';
        if (key === 'minTuition') return `Min Tuition: ₦${value}`;
        if (key === 'maxTuition') return `Max Tuition: ₦${value}`;
        if (key === 'minCutoff') return `Min Cutoff: ${value}`;
        if (key === 'maxCutoff') return `Max Cutoff: ${value}`;
        if (key === 'fieldOfStudy') return `Field: ${value}`;
        if (key === 'accreditationStatus') return `Accreditation: ${value.replace('_', ' ')}`;

        // Arrays are handled separately in render
        return `${key}: ${value}`;
    };

    const renderFilterChip = (key: keyof FilterState, value: any, customLabel?: string) => {
        const displayLabel = customLabel || formatLabel(key, value);

        return (
            <Badge key={`${key}-${value}`} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                {displayLabel}
                <button
                    onClick={() => {
                        if (Array.isArray(filters[key])) {
                            // For arrays, we need to remove just this item
                            const currentArray = filters[key] as any[];
                            const newArray = currentArray.filter(item => item !== value);
                            useSearchFilterStore.getState().setFilter(key, newArray.length > 0 ? newArray : undefined);
                        } else {
                            clearFilter(key);
                        }
                    }}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove filter ${displayLabel}`}
                >
                    <X className="h-3 w-3" />
                </button>
            </Badge>
        );
    };

    return (
        <div className={`flex flex-wrap items-center gap-2 ${className}`}>
            <span className="text-sm text-muted-foreground mr-2">Active Filters:</span>

            {/* Simple values */}
            {filters.search && renderFilterChip('search', filters.search)}
            {filters.state && renderFilterChip('state', filters.state)}
            {filters.verified && renderFilterChip('verified', true)}
            {filters.minTuition !== undefined && renderFilterChip('minTuition', filters.minTuition)}
            {filters.maxTuition !== undefined && renderFilterChip('maxTuition', filters.maxTuition)}
            {filters.minCutoff !== undefined && renderFilterChip('minCutoff', filters.minCutoff)}
            {filters.maxCutoff !== undefined && renderFilterChip('maxCutoff', filters.maxCutoff)}
            {filters.fieldOfStudy && renderFilterChip('fieldOfStudy', filters.fieldOfStudy)}
            {filters.accreditationStatus && renderFilterChip('accreditationStatus', filters.accreditationStatus)}

            {/* Array values */}
            {filters.institutionType?.map(type =>
                renderFilterChip('institutionType', type, `Type: ${type.replace('_', ' ')}`)
            )}
            {filters.degreeType?.map(type =>
                renderFilterChip('degreeType', type, `Degree: ${type.replace('_', ' ')}`)
            )}
            {filters.mode?.map(mode =>
                renderFilterChip('mode', mode, `Mode: ${mode.replace('_', ' ')}`)
            )}
            {filters.duration?.map(duration =>
                renderFilterChip('duration', duration, `Duration: ${duration} yrs`)
            )}

            <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs ml-auto"
            >
                Clear All
            </Button>
        </div>
    );
};
