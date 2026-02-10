import { FC, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminAPI } from '../lib/api';
import {
    Plus,
    Edit,
    Trash2,
    ExternalLink
} from 'lucide-react';

export const DeadlinesListPage: FC = () => {
    const [page, setPage] = useState(1);
    const [typeFilter, setTypeFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const queryClient = useQueryClient();

    const PAGE_SIZE = 50;

    // Fetch deadlines
    const { data: deadlines = [], isLoading, error } = useQuery({
        queryKey: ['admin', 'deadlines', page, typeFilter, priorityFilter],
        queryFn: () =>
            adminAPI.listDeadlines({
                offset: (page - 1) * PAGE_SIZE,
                limit: PAGE_SIZE,
                type: typeFilter || undefined,
                priority: priorityFilter || undefined,
            }),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: adminAPI.deleteDeadline,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'deadlines'] });
            alert('Deadline deleted successfully');
        },
        onError: (error: any) => {
            alert(`Error: ${error.response?.data?.detail || error.message}`);
        },
    });

    const handleDelete = async (id: string, title: string) => {
        if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
            deleteMutation.mutate(id);
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

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'exam': return 'bg-purple-100 text-purple-800';
            case 'admission': return 'bg-green-100 text-green-800';
            case 'scholarship': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Deadlines</h1>
                    <p className="mt-1 text-gray-600">
                        Manage application windows, exams, and important dates
                    </p>
                </div>
                <Link
                    to="/deadlines/new"
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Add Deadline
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow mb-6 p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <select
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value);
                            setPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                        <option value="">All Types</option>
                        <option value="admission">Admission</option>
                        <option value="exam">Exam</option>
                        <option value="scholarship">Scholarship</option>
                        <option value="event">Event</option>
                        <option value="other">Other</option>
                    </select>

                    <select
                        value={priorityFilter}
                        onChange={(e) => {
                            setPriorityFilter(e.target.value);
                            setPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    >
                        <option value="">All Priorities</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading deadlines...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-600">
                        Error loading deadlines: {(error as any).message}
                    </div>
                ) : deadlines.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-600 mb-4">No deadlines found</p>
                        <Link
                            to="/deadlines/new"
                            className="text-primary hover:underline"
                        >
                            Create your first deadline →
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {deadlines.map((deadline) => (
                                    <tr key={deadline.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{deadline.title}</p>
                                                {deadline.link && (
                                                    <a href={deadline.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                                        Open Link <ExternalLink size={10} />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(deadline.type)} capitalize`}>
                                                {deadline.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(deadline.priority)} capitalize`}>
                                                {deadline.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(deadline.end_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/deadlines/${deadline.id}/edit`}
                                                    className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(deadline.id, deadline.title)}
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

                <div className="px-6 py-4 border-t flex items-center justify-between">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">Page {page}</span>
                    <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={deadlines.length < PAGE_SIZE}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};
