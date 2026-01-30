import { FC, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminAPI } from '../lib/api';
import { formatDateTime } from '../lib/utils';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';

export const InstitutionsListPage: FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const queryClient = useQueryClient();

  // Fetch institutions
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'institutions', page, search, statusFilter],
    queryFn: () =>
      adminAPI.listInstitutions({
        page,
        page_size: 20,
        search: search || undefined,
        status_filter: statusFilter || undefined,
      }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: adminAPI.deleteInstitution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'institutions'] });
      alert('Institution deleted successfully');
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'draft' | 'published' | 'archived' }) =>
      adminAPI.updateInstitutionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'institutions'] });
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    },
  });

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const institutions = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Institutions</h1>
          <p className="mt-1 text-gray-600">
            Manage educational institutions across Nigeria
          </p>
        </div>
        <Link
          to="/institutions/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Institution
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to first page
              }}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          {/* Results count */}
          <div className="flex items-center text-sm text-gray-600">
            {pagination && (
              <span>
                Showing {(page - 1) * 20 + 1}-{Math.min(page * 20, pagination.total)} of{' '}
                {pagination.total} institutions
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading institutions...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            Error loading institutions: {(error as any).message}
          </div>
        ) : institutions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-4">No institutions found</p>
            <Link
              to="/institutions/new"
              className="text-primary hover:underline"
            >
              Create your first institution →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    State
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Programs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {institutions.map((institution) => (
                  <tr key={institution.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{institution.name}</p>
                        {institution.short_name && (
                          <p className="text-sm text-gray-500">{institution.short_name}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {institution.type.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{institution.state}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {institution.program_count}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          institution.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : institution.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {institution.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDateTime(institution.updated_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Toggle publish */}
                        <button
                          onClick={() => handleTogglePublish(institution.id, institution.status)}
                          className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded"
                          title={institution.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {institution.status === 'published' ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>

                        {/* Edit */}
                        <Link
                          to={`/institutions/${institution.id}/edit`}
                          className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(institution.id, institution.name)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.has_prev}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {page} of {pagination.total_pages}
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.has_next}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

InstitutionsListPage.displayName = 'InstitutionsListPage';
