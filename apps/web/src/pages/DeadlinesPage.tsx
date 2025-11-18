import { FC, useState } from 'react';
import { Button } from '@admitly/ui';
import { Calendar, List, Clock, AlertCircle, Bell } from 'lucide-react';
import { mockApplicationWindows, mockPrograms } from '@/lib/mockData';
import { format, parseISO, isBefore, differenceInDays } from 'date-fns';

type ViewMode = 'calendar' | 'list';

export const DeadlinesPage: FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Get deadlines with program info
  const deadlines = mockApplicationWindows.map((window) => {
    const program = mockPrograms.find((p) => p.id === window.program_id);
    return {
      ...window,
      program,
    };
  });

  // Sort by application end date
  const sortedDeadlines = [...deadlines].sort((a, b) => {
    return (
      new Date(a.application_end).getTime() - new Date(b.application_end).getTime()
    );
  });

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Application Deadlines</h1>
              <p className="text-gray-600 mt-1">
                Track important dates and never miss an application deadline
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
                Get notified when application deadlines are approaching
              </p>
              <Button variant="link" className="text-blue-600 p-0 h-auto mt-2">
                Configure Alerts
              </Button>
            </div>
          </div>
        </div>

        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-6">
            {/* Upcoming Deadlines */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Upcoming Deadlines</h2>
              {sortedDeadlines.length > 0 ? (
                <div className="space-y-4">
                  {sortedDeadlines.map((deadline) => {
                    const status = getDeadlineStatus(deadline.application_end);
                    return (
                      <div
                        key={deadline.id}
                        className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {deadline.program?.name || 'Unknown Program'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {deadline.program?.institution?.name}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Application Opens</p>
                              <p className="text-sm text-gray-600">
                                {format(parseISO(deadline.application_start), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">Application Closes</p>
                              <p className="text-sm text-gray-600">
                                {format(parseISO(deadline.application_end), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>

                          {deadline.screening_date && (
                            <div className="flex items-start gap-3">
                              <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">Screening Date</p>
                                <p className="text-sm text-gray-600">
                                  {format(parseISO(deadline.screening_date), 'MMM dd, yyyy')}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex gap-3">
                          <Button variant="outline" size="sm">
                            Set Reminder
                          </Button>
                          <Button variant="outline" size="sm">
                            View Program
                          </Button>
                        </div>
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
                    Start exploring programs to track their application deadlines
                  </p>
                </div>
              )}
            </div>
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
                  {
                    deadlines.filter((d) => {
                      const daysLeft = differenceInDays(
                        parseISO(d.application_end),
                        new Date()
                      );
                      return daysLeft > 0 && daysLeft <= 7;
                    }).length
                  }
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Open Applications</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {
                    deadlines.filter((d) => {
                      const now = new Date();
                      return (
                        isBefore(now, parseISO(d.application_end)) &&
                        !isBefore(now, parseISO(d.application_start))
                      );
                    }).length
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

DeadlinesPage.displayName = 'DeadlinesPage';
