import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI, DeadlineCreateData } from '../lib/api';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';

export const DeadlineFormPage: FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEditMode = !!id;

    const { register, handleSubmit, reset, formState: { errors } } = useForm<DeadlineCreateData>();

    // Fetch deadline data if in edit mode
    const { data: deadline, isLoading: isLoadingDeadline } = useQuery({
        queryKey: ['admin', 'deadline', id],
        queryFn: () => adminAPI.getDeadline(id!),
        enabled: isEditMode,
    });

    // Populate form when data loads
    useEffect(() => {
        if (deadline) {
            reset({
                title: deadline.title,
                description: deadline.description,
                start_date: deadline.start_date ? deadline.start_date.slice(0, 16) : '',
                end_date: deadline.end_date.slice(0, 16),
                screening_date: deadline.screening_date ? deadline.screening_date.slice(0, 16) : '',
                type: deadline.type as any,
                priority: deadline.priority as any,
                related_entity_type: deadline.related_entity_type as any,
                related_entity_id: deadline.related_entity_id,
                link: deadline.link,
            });
        }
    }, [deadline, reset]);

    // Mutations
    const createMutation = useMutation({
        mutationFn: adminAPI.createDeadline,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'deadlines'] });
            alert('Deadline created successfully');
            navigate('/deadlines');
        },
        onError: (error: any) => {
            console.error("Create error:", error);
            const detail = error.response?.data?.detail;
            const msg = typeof detail === 'object' ? JSON.stringify(detail) : (detail || error.message);
            alert(`Error creating deadline: ${msg}`);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: DeadlineCreateData) => adminAPI.updateDeadline(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'deadlines'] });
            alert('Deadline updated successfully');
            navigate('/deadlines');
        },
        onError: (error: any) => {
            console.error("Update error:", error);
            const detail = error.response?.data?.detail;
            const msg = typeof detail === 'object' ? JSON.stringify(detail) : (detail || error.message);
            alert(`Error updating deadline: ${msg}`);
        },
    });

    const onSubmit = (data: DeadlineCreateData) => {
        // Ensure dates are ISO suitable and empty strings are processed as null/undefined
        const payload = {
            ...data,
            start_date: data.start_date ? new Date(data.start_date).toISOString() : undefined,
            end_date: new Date(data.end_date).toISOString(),
            screening_date: data.screening_date ? new Date(data.screening_date).toISOString() : undefined,
            related_entity_id: data.related_entity_id && data.related_entity_id.trim() !== '' ? data.related_entity_id : undefined,
            related_entity_type: data.related_entity_type === 'none' ? undefined : data.related_entity_type,
            link: data.link && data.link.trim() !== '' ? data.link : undefined,
        };

        if (isEditMode) {
            updateMutation.mutate(payload as DeadlineCreateData);
        } else {
            createMutation.mutate(payload as DeadlineCreateData);
        }
    };

    if (isEditMode && isLoadingDeadline) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/deadlines')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ChevronLeft className="h-6 w-6 text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditMode ? 'Edit Deadline' : 'New Deadline'}
                    </h1>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        {...register('title', { required: 'Title is required', minLength: 3 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="e.g. Fall Admission 2025"
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        {...register('description')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            {...register('type', { required: true })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="other">Other</option>
                            <option value="exam">Exam</option>
                            <option value="admission">Admission</option>
                            <option value="scholarship">Scholarship</option>
                            <option value="event">Event</option>
                        </select>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            {...register('priority', { required: true })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            defaultValue="medium"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="datetime-local"
                            {...register('start_date')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    {/* End Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="datetime-local"
                            {...register('end_date', { required: "End date is required" })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date.message}</p>}
                    </div>
                    {/* Screening Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Screening Date</label>
                        <input
                            type="datetime-local"
                            {...register('screening_date')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>

                {/* Link */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">External Link</label>
                    <input
                        {...register('link')}
                        type="url"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="https://..."
                    />
                </div>

                {/* Related Entity (Simplified for now - could be a search dropdown later) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Related Entity Type</label>
                        <select
                            {...register('related_entity_type')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            defaultValue="none"
                        >
                            <option value="none">None</option>
                            <option value="program">Program</option>
                            <option value="institution">Institution</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Related Entity ID (UUID)</label>
                        <input
                            {...register('related_entity_id')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            placeholder="UUID..."
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        {isEditMode ? 'Update Deadline' : 'Create Deadline'}
                    </button>
                </div>

            </form>
        </div>
    );
};
