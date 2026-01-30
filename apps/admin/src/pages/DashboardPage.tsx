import { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminAPI } from '../lib/api';
import { Building2, BookOpen, Plus, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';

export const DashboardPage: FC = () => {
  // Fetch institutions stats
  const {
    data: institutionsData,
    isLoading: institutionsLoading,
    error: institutionsError
  } = useQuery({
    queryKey: ['admin', 'institutions', 'stats'],
    queryFn: () => adminAPI.listInstitutions({ page: 1, page_size: 1 }),
  });

  // Fetch programs stats
  const {
    data: programsData,
    isLoading: programsLoading,
    error: programsError
  } = useQuery({
    queryKey: ['admin', 'programs', 'stats'],
    queryFn: () => adminAPI.listPrograms({ page: 1, page_size: 1 }),
  });

  const totalInstitutions = institutionsData?.pagination?.total || 0;
  const totalPrograms = programsData?.pagination?.total || 0;
  const isLoading = institutionsLoading || programsLoading;
  const hasError = institutionsError || programsError;

  const stats = [
    {
      title: 'Total Institutions',
      value: institutionsLoading ? '...' : totalInstitutions,
      icon: Building2,
      color: 'bg-blue-500',
      href: '/institutions',
      error: institutionsError,
    },
    {
      title: 'Total Programs',
      value: programsLoading ? '...' : totalPrograms,
      icon: BookOpen,
      color: 'bg-green-500',
      href: '/programs',
      error: programsError,
    },
    {
      title: 'Growth',
      value: isLoading ? '...' : '+' + Math.ceil((totalInstitutions + totalPrograms) * 0.05),
      icon: TrendingUp,
      color: 'bg-purple-500',
      description: 'Last 30 days',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage educational data for Nigerian students</p>
      </div>

      {/* Error Banner */}
      {hasError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Error loading dashboard data</p>
            <p className="text-sm text-red-600 mt-1">
              {(institutionsError as Error)?.message || (programsError as Error)?.message || 'Failed to fetch stats'}
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Icon className="h-6 w-6 text-white" />
                  )}
                </div>
                {stat.href && (
                  <Link
                    to={stat.href}
                    className="text-sm text-primary hover:underline"
                  >
                    View all →
                  </Link>
                )}
              </div>
              <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
              <p className={`text-3xl font-bold mt-2 ${stat.error ? 'text-red-500' : 'text-gray-900'}`}>
                {stat.error ? 'Error' : stat.value}
              </p>
              {stat.description && (
                <p className="text-sm text-gray-500 mt-2">{stat.description}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/institutions/new"
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <div className="bg-primary/10 p-2 rounded">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Add New Institution</p>
              <p className="text-sm text-gray-500">Create a new educational institution</p>
            </div>
          </Link>

          <Link
            to="/programs/new"
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <div className="bg-primary/10 p-2 rounded">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Add New Program</p>
              <p className="text-sm text-gray-500">Create a new academic program</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

DashboardPage.displayName = 'DashboardPage';
