import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI, ProgramCreateData, ProgramUpdateData } from '../lib/api';
import { ArrowLeft, Save } from 'lucide-react';

export default function ProgramFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ProgramCreateData>({
    institution_id: '',
    name: '',
    degree_type: 'undergraduate',
    duration_years: 4,
    mode: 'full_time',
    tuition_per_year: 0,
    acceptance_fee: undefined,
    cutoff_score: undefined,
    accreditation_status: '',
    description: '',
    status: 'draft',
  });

  // Fetch program for editing
  const { data: program } = useQuery({
    queryKey: ['admin', 'program', id],
    queryFn: () => adminAPI.getProgram(id!),
    enabled: isEdit,
  });

  // Fetch institutions for dropdown
  const { data: institutionsData } = useQuery({
    queryKey: ['admin', 'institutions', 'all'],
    queryFn: () => adminAPI.listInstitutions({ page: 1, page_size: 1000 }),
  });

  // Populate form when editing
  useEffect(() => {
    if (program && isEdit) {
      setFormData({
        institution_id: program.institution_id,
        name: program.name,
        degree_type: program.degree_type as any,
        duration_years: program.duration_years,
        mode: program.mode as any,
        tuition_per_year: program.tuition_per_year,
        acceptance_fee: program.acceptance_fee || undefined,
        cutoff_score: program.cutoff_score || undefined,
        accreditation_status: program.accreditation_status || '',
        description: program.description || '',
        status: program.status as any,
      });
    }
  }, [program, isEdit]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: adminAPI.createProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
      alert('Program created successfully');
      navigate('/programs');
    },
    onError: (error: any) => {
      alert(`Failed to create program: ${error.response?.data?.detail || error.message}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; updates: ProgramUpdateData }) =>
      adminAPI.updateProgram(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'program', id] });
      alert('Program updated successfully');
      navigate('/programs');
    },
    onError: (error: any) => {
      alert(`Failed to update program: ${error.response?.data?.detail || error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.institution_id) {
      alert('Please select an institution');
      return;
    }
    if (!formData.name.trim()) {
      alert('Program name is required');
      return;
    }
    if (formData.tuition_per_year < 0) {
      alert('Tuition must be a positive number');
      return;
    }
    if (formData.duration_years < 1 || formData.duration_years > 10) {
      alert('Duration must be between 1 and 10 years');
      return;
    }

    // Clean up empty optional fields
    const cleanData = {
      ...formData,
      acceptance_fee: formData.acceptance_fee || undefined,
      cutoff_score: formData.cutoff_score || undefined,
      accreditation_status: formData.accreditation_status?.trim() || undefined,
      description: formData.description?.trim() || undefined,
    };

    if (isEdit) {
      updateMutation.mutate({ id: id!, updates: cleanData });
    } else {
      createMutation.mutate(cleanData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: value === '' ? undefined : Number(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/programs')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Program' : 'Add New Program'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Update program information' : 'Create a new program'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Institution */}
            <div className="md:col-span-2">
              <label htmlFor="institution_id" className="block text-sm font-medium text-gray-700 mb-1">
                Institution *
              </label>
              <select
                id="institution_id"
                name="institution_id"
                value={formData.institution_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an institution</option>
                {institutionsData?.data.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} {inst.short_name ? `(${inst.short_name})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Program Name */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Program Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Computer Science, Business Administration"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Degree Type */}
            <div>
              <label htmlFor="degree_type" className="block text-sm font-medium text-gray-700 mb-1">
                Degree Type *
              </label>
              <select
                id="degree_type"
                name="degree_type"
                value={formData.degree_type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="undergraduate">Undergraduate</option>
                <option value="nd">ND (National Diploma)</option>
                <option value="hnd">HND (Higher National Diploma)</option>
                <option value="pre_degree">Pre-Degree</option>
                <option value="jupeb">JUPEB</option>
                <option value="postgraduate">Postgraduate</option>
              </select>
            </div>

            {/* Mode */}
            <div>
              <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-1">
                Study Mode *
              </label>
              <select
                id="mode"
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="full_time">Full-Time</option>
                <option value="part_time">Part-Time</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration_years" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (Years) *
              </label>
              <input
                type="number"
                id="duration_years"
                name="duration_years"
                value={formData.duration_years}
                onChange={handleChange}
                required
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Brief description of the program..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tuition */}
            <div>
              <label htmlFor="tuition_per_year" className="block text-sm font-medium text-gray-700 mb-1">
                Annual Tuition (₦) *
              </label>
              <input
                type="number"
                id="tuition_per_year"
                name="tuition_per_year"
                value={formData.tuition_per_year}
                onChange={handleChange}
                required
                min="0"
                placeholder="250000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Acceptance Fee */}
            <div>
              <label htmlFor="acceptance_fee" className="block text-sm font-medium text-gray-700 mb-1">
                Acceptance Fee (₦)
              </label>
              <input
                type="number"
                id="acceptance_fee"
                name="acceptance_fee"
                value={formData.acceptance_fee || ''}
                onChange={handleChange}
                min="0"
                placeholder="50000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cutoff Score */}
            <div>
              <label htmlFor="cutoff_score" className="block text-sm font-medium text-gray-700 mb-1">
                JAMB Cutoff Score
              </label>
              <input
                type="number"
                id="cutoff_score"
                name="cutoff_score"
                value={formData.cutoff_score || ''}
                onChange={handleChange}
                min="0"
                max="400"
                placeholder="200"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Accreditation Status */}
            <div>
              <label
                htmlFor="accreditation_status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Accreditation Status
              </label>
              <input
                type="text"
                id="accreditation_status"
                name="accreditation_status"
                value={formData.accreditation_status}
                onChange={handleChange}
                placeholder="e.g., Fully Accredited"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/programs')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {isLoading ? 'Saving...' : isEdit ? 'Update Program' : 'Create Program'}
          </button>
        </div>
      </form>
    </div>
  );
}
