import { FC } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { useComparisonStore } from '@/stores/comparisonStore';
import { useInstitution, useInstitutionPrograms } from '@/hooks/api';
import { Button, Skeleton } from '@admitly/ui';
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
  AlertCircle,
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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb Skeleton */}
          <div className="mb-6 flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <span className="text-gray-300">/</span>
            <Skeleton className="h-4 w-20" />
            <span className="text-gray-300">/</span>
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Header Card Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Skeleton className="h-24 w-24 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-32 rounded-full" />
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error or not found
  if (isErrorInstitution || !institution) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
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
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{institution.name}</span>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <div className="h-24 w-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200 overflow-hidden">
              {institution.logo_url ? (
                <img
                  src={institution.logo_url}
                  alt={institution.name}
                  className="h-full w-full object-contain p-2"
                  onError={handleImageError}
                />
              ) : null}
              <School className="h-12 w-12 text-gray-400" />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{institution.name}</h1>
                  {institution.short_name && (
                    <p className="text-lg text-gray-600">({institution.short_name})</p>
                  )}
                </div>
                {institution.verified && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex-shrink-0 self-start">
                    <CheckCircle className="h-4 w-4" />
                    <span>Verified</span>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>
                  {institution.city}, {institution.state}
                </span>
              </div>

              {/* Type */}
              <div className="mb-5">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                  {institution.type.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={bookmarked ? 'default' : 'outline'}
                  onClick={handleBookmark}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <Bookmark className={`h-4 w-4 ${bookmarked ? 'fill-current' : ''}`} />
                  {bookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>

                <Button
                  variant={inComparison ? 'default' : 'outline'}
                  onClick={handleCompare}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <GitCompare className="h-4 w-4" />
                  {inComparison ? 'In Comparison' : 'Compare'}
                </Button>

                {institution.website && (
                  <Button variant="outline" size="sm" asChild>
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
              <div className="prose prose-sm max-w-none text-gray-700">
                {institution.description ? (
                  <p className="whitespace-pre-line">{institution.description}</p>
                ) : (
                  <p className="text-gray-500 italic">No description available for this institution at the moment.</p>
                )}
              </div>
            </div>

            {/* Programs */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Programs Offered</h2>
                <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                  {programs.length} programs
                </span>
              </div>

              {isLoadingPrograms ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border border-gray-100 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-4 w-4" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-20 rounded" />
                        <Skeleton className="h-6 w-20 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : programs.length > 0 ? (
                <div className="space-y-3">
                  {programs.map((program) => (
                    <Link
                      key={program.id}
                      to={`/programs/${program.slug}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                            {program.name}
                          </h3>
                          <div className="flex gap-2 flex-wrap">
                            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-100 uppercase font-medium">
                              {program.degree_type}
                            </span>
                            <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded border border-green-100">
                              {program.duration_years} years
                            </span>
                            {program.mode && (
                              <span className="text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded border border-gray-100 capitalize">
                                {program.mode.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                          {program.tuition_per_year > 0 && (
                            <p className="text-sm text-gray-600 mt-2 font-medium">
                              ₦{program.tuition_per_year.toLocaleString()}/year
                            </p>
                          )}
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <School className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No programs listed</h3>
                  <p className="text-sm text-gray-500">
                    This institution hasn't listed any programs yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4 text-gray-900">Contact Information</h3>
              <div className="space-y-4">
                {institution.email ? (
                  <div className="flex items-start gap-3 group">
                    <Mail className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                    <div className="overflow-hidden">
                      <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Email</p>
                      <a
                        href={`mailto:${institution.email}`}
                        className="text-sm text-gray-900 hover:text-primary hover:underline truncate block"
                      >
                        {institution.email}
                      </a>
                    </div>
                  </div>
                ) : null}

                {institution.phone ? (
                  <div className="flex items-start gap-3 group">
                    <Phone className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Phone</p>
                      <a
                        href={`tel:${institution.phone}`}
                        className="text-sm text-gray-900 hover:text-primary hover:underline"
                      >
                        {institution.phone}
                      </a>
                    </div>
                  </div>
                ) : null}

                {institution.address ? (
                  <div className="flex items-start gap-3 group">
                    <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Address</p>
                      <p className="text-sm text-gray-900">{institution.address}</p>
                    </div>
                  </div>
                ) : null}

                {institution.website ? (
                  <div className="flex items-start gap-3 group">
                    <Globe className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                    <div className="overflow-hidden">
                      <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Website</p>
                      <a
                        href={institution.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-900 hover:text-primary hover:underline truncate block"
                      >
                        {institution.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    </div>
                  </div>
                ) : null}

                {!institution.email && !institution.phone && !institution.address && !institution.website && (
                  <p className="text-sm text-gray-500 italic">No contact information available.</p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4 text-gray-900">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">Total Programs</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {institution.program_count}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">Type</span>
                  <span className="text-sm font-semibold text-gray-900 capitalize">
                    {institution.type.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">State</span>
                  <span className="text-sm font-semibold text-gray-900">{institution.state}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`text-sm font-semibold ${institution.verified ? 'text-green-600' : 'text-gray-500'}`}>
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
