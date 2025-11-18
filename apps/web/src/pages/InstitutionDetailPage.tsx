import { FC } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { useComparisonStore } from '@/stores/comparisonStore';
import { useInstitution, useInstitutionPrograms } from '@/hooks/api';
import { Button } from '@admitly/ui';
import {
  Bookmark,
  GitCompare,
  MapPin,
  Globe,
  Mail,
  Phone,
  CheckCircle,
  ExternalLink,
  School,
} from 'lucide-react';

export const InstitutionDetailPage: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarkStore();
  const { isInComparison, addItem, removeItem } = useComparisonStore();

  // Fetch institution and programs from API
  const {
    data: institution,
    isLoading: isLoadingInstitution,
    isError: isErrorInstitution,
    error: institutionError,
  } = useInstitution(slug || '');

  const {
    data: programsData,
    isLoading: isLoadingPrograms,
  } = useInstitutionPrograms(slug || '');

  const programs = programsData?.data || [];

  // Handle loading state
  if (isLoadingInstitution) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 bg-gray-200 animate-pulse rounded-lg mx-auto mb-4" />
          <p className="text-gray-600">Loading institution details...</p>
        </div>
      </div>
    );
  }

  // Handle error or not found
  if (isErrorInstitution || !institution) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Institution not found</h2>
          <p className="text-gray-600 mb-6">
            {institutionError?.message || "The institution you're looking for doesn't exist or has been removed."}
          </p>
          <Button asChild>
            <Link to="/institutions">Browse Institutions</Link>
          </Button>
        </div>
      </div>
    );
  }

  const bookmarked = isBookmarked(institution.id, 'institution');
  const inComparison = isInComparison(institution.id);

  const handleBookmark = () => {
    if (bookmarked) {
      removeBookmark(institution.id, 'institution');
    } else {
      addBookmark(institution.id, 'institution');
    }
  };

  const handleCompare = () => {
    if (inComparison) {
      removeItem(institution.id);
    } else {
      addItem(institution.id, 'institution');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span>/</span>
          <Link to="/institutions" className="hover:text-primary">
            Institutions
          </Link>
          <span>/</span>
          <span className="text-gray-900">{institution.name}</span>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <div className="h-24 w-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {institution.logo_url ? (
                <img
                  src={institution.logo_url}
                  alt={institution.name}
                  className="h-20 w-20 object-contain"
                />
              ) : (
                <School className="h-12 w-12 text-gray-400" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{institution.name}</h1>
                  {institution.short_name && (
                    <p className="text-lg text-gray-600">({institution.short_name})</p>
                  )}
                </div>
                {institution.verified && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Verified</span>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {institution.city}, {institution.state}
                </span>
              </div>

              {/* Type */}
              <div className="mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {institution.type.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={bookmarked ? 'default' : 'outline'}
                  onClick={handleBookmark}
                  className="flex items-center gap-2"
                >
                  <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
                  {bookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>

                <Button
                  variant={inComparison ? 'default' : 'outline'}
                  onClick={handleCompare}
                  className="flex items-center gap-2"
                >
                  <GitCompare className="h-4 w-4" />
                  {inComparison ? 'In Comparison' : 'Compare'}
                </Button>

                {institution.website && (
                  <Button variant="outline" asChild>
                    <a
                      href={institution.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      Visit Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {institution.description ||
                  'No description available for this institution at the moment.'}
              </p>
            </div>

            {/* Programs */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Programs Offered</h2>
                <span className="text-sm text-gray-600">{programs.length} programs</span>
              </div>

              {isLoadingPrograms ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : programs.length > 0 ? (
                <div className="space-y-3">
                  {programs.map((program) => (
                    <Link
                      key={program.id}
                      to={`/programs/${program.slug}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{program.name}</h3>
                          <div className="flex gap-2 flex-wrap">
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              {program.degree_type}
                            </span>
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                              {program.duration_years} years
                            </span>
                            {program.mode && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                {program.mode}
                              </span>
                            )}
                          </div>
                          {program.tuition_per_year && (
                            <p className="text-sm text-gray-600 mt-2">
                              ₦{program.tuition_per_year.toLocaleString()}/year
                            </p>
                          )}
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No programs available</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">Contact Information</h3>
              <div className="space-y-3">
                {institution.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a
                        href={`mailto:${institution.email}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {institution.email}
                      </a>
                    </div>
                  </div>
                )}

                {institution.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <a
                        href={`tel:${institution.phone}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {institution.phone}
                      </a>
                    </div>
                  </div>
                )}

                {institution.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="text-sm text-gray-900">{institution.address}</p>
                    </div>
                  </div>
                )}

                {institution.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Website</p>
                      <a
                        href={institution.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {institution.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Programs</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {institution.program_count}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Type</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {institution.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">State</span>
                  <span className="text-sm font-semibold text-gray-900">{institution.state}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="text-sm font-semibold text-green-600">
                    {institution.verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

InstitutionDetailPage.displayName = 'InstitutionDetailPage';
