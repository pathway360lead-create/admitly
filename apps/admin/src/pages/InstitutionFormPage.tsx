import { FC, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminAPI } from '../lib/api';
import { INSTITUTION_TYPES, NIGERIAN_STATES } from '../types';
import { Save, ArrowLeft } from 'lucide-react';

export const InstitutionFormPage: FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    short_name: '',
    type: 'federal_university',
    state: '',
    city: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    year_established: '',
    accreditation_status: '',
    verified: false,
    status: 'draft' as 'draft' | 'published' | 'archived',
  });

  // Fetch institution if editing
  const { data: institution, isLoading } = useQuery({
    queryKey: ['admin', 'institution', id],
    queryFn: () => adminAPI.getInstitution(id!),
    enabled: isEdit,
  });

  // Populate form with existing data
  useEffect(() => {
    if (institution) {
      setFormData({
        name: institution.name || '',
        short_name: institution.short_name || '',
        type: institution.type || 'federal_university',
        state: institution.state || '',
        city: institution.city || '',
        description: institution.description || '',
        address: institution.address || '',
        phone: institution.phone || '',
        email: institution.email || '',
        website: institution.website || '',
        year_established: institution.year_established?.toString() || '',
        accreditation_status: institution.accreditation_status || '',
        verified: institution.verified || false,
        status: (institution.status as any) || 'draft',
      });
    }
  }, [institution]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: adminAPI.createInstitution,
    onSuccess: () => {
      alert('Institution created successfully!');
      navigate('/institutions');
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      adminAPI.updateInstitution(id, data),
    onSuccess: () => {
      alert('Institution updated successfully!');
      navigate('/institutions');
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.detail || error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare data
    const data: any = {
      ...formData,
      year_established: formData.year_established
        ? parseInt(formData.year_established)
        : undefined,
    };

    // Remove empty strings
    Object.keys(data).forEach((key) => {
      if (data[key] === '') {
        data[key] = undefined;
      }
    });

    if (isEdit) {
      updateMutation.mutate({ id: id!, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/institutions')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Institutions
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Edit Institution' : 'Add New Institution'}
        </h1>
        <p className="mt-1 text-gray-600">
          {isEdit ? 'Update institution details' : 'Enter institution information manually'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="University of Lagos"
                />
              </div>

              {/* Short Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Name
                </label>
                <input
                  type="text"
                  name="short_name"
                  value={formData.short_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="UNILAG"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  {INSTITUTION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <select
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="">Select state</option>
                  {NIGERIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Lagos"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Brief description of the institution..."
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Akoka, Lagos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="+234-1-4932043"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="info@unilag.edu.ng"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="https://unilag.edu.ng"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Established
                </label>
                <input
                  type="number"
                  name="year_established"
                  min="1800"
                  max="2100"
                  value={formData.year_established}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="1962"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accreditation Status
                </label>
                <input
                  type="text"
                  name="accreditation_status"
                  value={formData.accreditation_status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Fully Accredited"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Only published institutions are visible to students
                </p>
              </div>

              <div className="flex items-center pt-7">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="verified"
                    checked={formData.verified}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Verified Institution
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/institutions')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isEdit ? 'Update' : 'Create'} Institution
          </button>
        </div>
      </form>
    </div>
  );
};

InstitutionFormPage.displayName = 'InstitutionFormPage';
