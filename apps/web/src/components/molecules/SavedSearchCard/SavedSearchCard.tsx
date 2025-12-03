import { FC, useState } from 'react';
import { Edit, Trash2, Play, Bell, BellOff, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Badge } from '@admitly/ui';
import { SavedSearch } from '@/types/user-features';

export interface SavedSearchCardProps {
    savedSearch: SavedSearch;
    onExecute?: (searchId: string) => Promise<void> | void;
    onEdit?: (searchId: string) => void;
    onDelete?: (searchId: string) => Promise<void> | void;
    onToggleNotify?: (searchId: string, notify: boolean) => Promise<void> | void;
    className?: string;
}

export const SavedSearchCard: FC<SavedSearchCardProps> = ({
    savedSearch,
    onExecute,
    onEdit,
    onDelete,
    onToggleNotify,
    className,
}) => {
    const [isExecuting, setIsExecuting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isTogglingNotify, setIsTogglingNotify] = useState(false);

    const handleExecute = async () => {
        if (!onExecute) return;
        setIsExecuting(true);
        try {
            await onExecute(savedSearch.id);
        } finally {
            setIsExecuting(false);
        }
    };

    const handleDelete = async () => {
        if (!onDelete) return;
        setIsDeleting(true);
        try {
            await onDelete(savedSearch.id);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleNotify = async () => {
        if (!onToggleNotify) return;
        setIsTogglingNotify(true);
        try {
            await onToggleNotify(savedSearch.id, !savedSearch.notify_on_new_results);
        } finally {
            setIsTogglingNotify(false);
        }
    };

    return (
        <Card className={cn('w-full', className)}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">
                        {savedSearch.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        {savedSearch.query ? `"${savedSearch.query}"` : 'No query text'}
                    </p>
                </div>
                {onToggleNotify && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleToggleNotify}
                        disabled={isTogglingNotify}
                        aria-label={savedSearch.notify_on_new_results ? "Turn off notifications" : "Turn on notifications"}
                    >
                        {isTogglingNotify ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : savedSearch.notify_on_new_results ? (
                            <Bell className="h-4 w-4 text-primary fill-primary" />
                        ) : (
                            <BellOff className="h-4 w-4 text-muted-foreground" />
                        )}
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                    {Object.entries(savedSearch.filters || {}).map(([key, value]) => {
                        if (!value || (Array.isArray(value) && value.length === 0)) return null;
                        return (
                            <Badge key={key} variant="secondary" className="text-xs">
                                {key.replace(/_/g, ' ')}: {Array.isArray(value) ? value.join(', ') : String(value)}
                            </Badge>
                        );
                    })}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                    <p>Last executed: {savedSearch.last_executed_at ? format(new Date(savedSearch.last_executed_at), 'MMM d, yyyy') : 'Never'}</p>
                    <p>Execution count: {savedSearch.execution_count}</p>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                {onDelete && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isDeleting || isExecuting}
                        className="text-destructive hover:text-destructive"
                    >
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                        Delete
                    </Button>
                )}
                {onEdit && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(savedSearch.id)}
                        disabled={isDeleting || isExecuting}
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                )}
                {onExecute && (
                    <Button
                        size="sm"
                        onClick={handleExecute}
                        disabled={isDeleting || isExecuting}
                    >
                        {isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                        Execute
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};
