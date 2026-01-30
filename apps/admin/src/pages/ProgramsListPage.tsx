import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { adminAPI, Program } from '../lib/api';
import { Search, Plus, Edit2, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';

export default function ProgramsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [institutionFilter, setInstitutionFilter] = useState('');
  const [degreeTypeFilter, setDegreeTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch programs
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'programs', page, search, institutionFilter, degreeTypeFilter, statusFilter],
    queryFn: () =>
      adminAPI.listPrograms({
        page,
        page_size: 20,
        institution_id: institutionFilter || undefined,
        degree_type: degreeTypeFilter || undefined,
        status_filter: statusFilter || undefined,
        search: search || undefined,
      }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: adminAPI.deleteProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
      alert('Program deleted successfully');
    },
    onError: (error: any) => {
      alert(`Failed to delete program: ${error.response?.data?.detail || error.message}`);
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'draft' | 'published' | 'archived' }) =>
      adminAPI.updateProgramStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
      alert('Program status updated successfully');
    },
    onError: (error: any) => {
      alert(`Failed to update status: ${error.response?.data?.detail || error.message}`);
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    if (window.confirm(`Change status to "${newStatus}"?`)) {
      updateStatusMutation.mutate({ id, status: newStatus as 'draft' | 'published' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDegreeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      undergraduate: 'Undergraduate',
      nd: 'ND',
      hnd: 'HND',
      pre_degree: 'Pre-Degree',
      jupeb: 'JUPEB',
      postgraduate: 'Postgraduate',
    };
    return labels[type] || type;
  };

  const getModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      full_time: 'Full-Time',
      part_time: 'Part-Time',
      online: 'Online',
      hybrid: 'Hybrid',
    };
    return labels[mode] || mode;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Programs</h1>
          <p className="text-gray-600 mt-1">Manage educational programs</p>
        </div>
        <button
          onClick={() => navigate('/programs/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Program
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search programs..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Degree Type</label>
            <select
              value={degreeTypeFilter}
              onChange={(e) => {
                setDegreeTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Degree Types</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="nd">ND</option>
              <option value="hnd">HND</option>
              <option value="pre_degree">Pre-Degree</option>
              <option value="jupeb">JUPEB</option>
              <option value="postgraduate">Postgraduate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution ID</label>
            <input
              type="text"
              placeholder="Filter by institution..."
              value={institutionFilter}
              onChange={(e) => {
                setInstitutionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Results count */}
      {data && (
        <div className="text-sm text-gray-600">
          Showing {data.data.length} of {data.pagination.total} programs
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading programs...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p className="font-medium">Error loading programs</p>
          <p className="text-sm mt-1">{(error as any).message}</p>
        </div>
      )}

      {/* Programs table */}
      {data && data.data.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Institution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Degree Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tuition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.data.map((program: Program) => (
                  <tr key={program.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{program.name}</div>
                      <div className="text-xs text-gray-500">{getModeLabel(program.mode)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {program.institution?.name || 'N/A'}
                      </div>
                      {program.institution?.short_name && (
                        <div className="text-xs text-gray-500">{program.institution.short_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {getDegreeTypeLabel(program.degree_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {program.duration_years} {program.duration_years === 1 ? 'year' : 'years'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(program.tuition_per_year)}/year
                      </div>
                      {program.cutoff_score && (
                        <div className="text-xs text-gray-500">Cutoff: {program.cutoff_score}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          program.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : program.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {program.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/programs/${program.id}/edit`)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleStatusChange(program.id, program.status)}
                          className={`${
                            program.status === 'published'
                              ? 'text-yellow-600 hover:text-yellow-900'
                              : 'text-green-600 hover:text-green-900'
                          } p-1`}
                          title={program.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {program.status === 'published' ? (
                            <XCircle size={16} />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(program.id, program.name)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.pagination.total_pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.pagination.has_prev}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {data.pagination.page} of {data.pagination.total_pages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.pagination.has_next}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {data && data.data.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No programs found</p>
          <button
            onClick={() => navigate('/programs/new')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Add First Program
          </button>
        </div>
      )}
    </div>
  );
}
