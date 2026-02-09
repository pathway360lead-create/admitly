import { FC, useState } from 'react';
import { Button } from '@admitly/ui';
import { Calendar, List, Clock, AlertCircle, Bell, Loader2 } from 'lucide-react';
import { useDeadlines } from '@/hooks/useDeadlines';
import { format, parseISO, isBefore, differenceInDays } from 'date-fns';

type ViewMode = 'calendar' | 'list';

export const DeadlinesPage: FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { data: deadlines = [], isLoading, error } = useDeadlines();

  const getDeadlineStatus = (endDate: string) => {
    const end = parseISO(endDate);
    const now = new Date();
    const daysLeft = differenceInDays(end, now);

    if (isBefore(end, now)) {
      return {
        label: 'Closed',
        color: 'text-gray-500',
        bg: 'bg-gray-100',
      };
    } else if (daysLeft <= 7) {
      return {
        label: `${daysLeft} days left`,
        color: 'text-red-700',
        bg: 'bg-red-100',
      };
    } else if (daysLeft <= 30) {
      return {
        label: `${daysLeft} days left`,
        color: 'text-yellow-700',
        bg: 'bg-yellow-100',
      };
    } else {
      return {
        label: `${daysLeft} days left`,
        color: 'text-green-700',
        bg: 'bg-green-100',
      };
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exam': return 'bg-purple-100 text-purple-800';
      case 'admission': return 'bg-green-100 text-green-800';
      case 'scholarship': return 'bg-yellow-100 text-yellow-800';
      case 'event': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Sort by end date
  const sortedDeadlines = [...deadlines].sort(
    (a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Important Deadlines</h1>
              <p className="text-gray-600 mt-1">
                Track important dates and never miss an opportunity
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                List
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                onClick={() => setViewMode('calendar')}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Calendar
              </Button>
            </div>
          </div>

          {/* Alert Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Bell className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Set up deadline alerts</p>
              <p className="text-sm text-blue-700 mt-1">
                Get notified when important deadlines are approaching
              </p>
              <Button variant="link" className="text-blue-600 p-0 h-auto mt-2">
                Configure Alerts
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-gray-600">Loading deadlines...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to load deadlines</h3>
            <p className="text-red-700">Please try again later</p>
          </div>
        )}

        {/* List View */}
        {!isLoading && !error && viewMode === 'list' && (
          <div className="space-y-6">
            {sortedDeadlines.length > 0 ? (
              <div className="space-y-4">
                {sortedDeadlines.map((deadline) => {
                  const status = getDeadlineStatus(deadline.end_date);
                  return (
                    <div
                      key={deadline.id}
                      className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {deadline.title}
                          </h3>
                          {deadline.description && (
                            <p className="text-sm text-gray-600">{deadline.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(deadline.type)} capitalize`}>
                            {deadline.type}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(deadline.priority)} capitalize`}>
                            {deadline.priority}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {deadline.start_date && (
                          <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Starts</p>
                              <p className="text-sm text-gray-600">
                                {format(parseISO(deadline.start_date), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">Deadline</p>
                            <p className="text-sm text-gray-600">
                              {format(parseISO(deadline.end_date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>

                        {deadline.screening_date && (
                          <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Screening</p>
                              <p className="text-sm text-gray-600">
                                {format(parseISO(deadline.screening_date), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {deadline.link && (
                        <div className="mt-4">
                          <a
                            href={deadline.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            Learn more →
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No deadlines available
                </h3>
                <p className="text-gray-600">
                  Check back later for important dates and deadlines
                </p>
              </div>
            )}
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar View</h3>
              <p className="text-gray-600 mb-6">
                Calendar visualization coming soon. For now, use the list view to see all deadlines.
              </p>
              <Button onClick={() => setViewMode('list')}>Switch to List View</Button>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {!isLoading && !error && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Deadlines</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{deadlines.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Closing Soon</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {deadlines.filter((d) => {
                      const daysLeft = differenceInDays(parseISO(d.end_date), new Date());
                      return daysLeft > 0 && daysLeft <= 7;
                    }).length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">High Priority</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    {deadlines.filter((d) => d.priority === 'high').length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

DeadlinesPage.displayName = 'DeadlinesPage';
