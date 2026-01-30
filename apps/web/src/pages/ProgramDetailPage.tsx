import { FC } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { useComparisonStore } from '@/stores/comparisonStore';
import { useProgramDetail, useDeadlines } from '@/hooks/api';
import { Button, Skeleton } from '@admitly/ui';
import {
  Bookmark,
  GitCompare,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Calendar,
  GraduationCap,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const ProgramDetailPage: FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarkStore();
  const { isInComparison, addItem, removeItem } = useComparisonStore();

  // Fetch program from API (using slug as id - backend should support this)
  const {
    data: program,
    isLoading,
    isError,
    error,
  } = useProgramDetail(slug || '');

  // Fetch deadlines for this program
  const { data: deadlinesData, isLoading: isLoadingDeadlines } = useDeadlines(
    program ? { program_id: program.id } : {},
    { enabled: !!program }
  );

  const deadlines = deadlinesData?.data || [];
  const activeDeadline = deadlines.find(d => d.status === 'open' || d.status === 'closing_soon') || deadlines[0];

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb Skeleton */}
          <div className="mb-6 flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <span className="text-gray-300">/</span>
            <Skeleton className="h-4 w-20" />
            <span className="text-gray-300">/</span>
            <Skeleton className="h-4 w-40" />
          </div>

          {/* Header Card Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Skeleton className="h-24 w-24 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-80 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error or not found
  if (isError || !program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Program not found</h2>
          <p className="text-gray-600 mb-6">
            {error?.message || "The program you're looking for doesn't exist or has been removed."}
          </p>
          <Button asChild>
            <Link to="/programs">Browse Programs</Link>
          </Button>
        </div>
      </div>
    );
  }

  const bookmarked = isBookmarked(program.id, 'program');
  const inComparison = isInComparison(program.id);

  const handleBookmark = () => {
    if (bookmarked) {
      removeBookmark(program.id, 'program');
    } else {
      addBookmark(program.id, 'program');
    }
  };

  const handleCompare = () => {
    if (inComparison) {
      removeItem(program.id);
    } else {
      addItem(program.id, 'program');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="program-detail">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span>/</span>
          <Link to="/programs" className="hover:text-primary">
            Programs
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{program.name}</span>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="h-24 w-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center flex-shrink-0 border border-primary/10">
              <GraduationCap className="h-12 w-12 text-primary" />
            </div>

            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2" data-testid="program-name">{program.name}</h1>
              {program.institution && (
                <Link
                  to={`/institutions/${program.institution.slug}`}
                  className="text-lg text-primary hover:underline mb-4 inline-flex items-center gap-1"
                  data-testid="institution-link"
                >
                  {program.institution.name}
                  <ExternalLink className="h-4 w-4" />
                </Link>
              )}

              <div className="flex flex-wrap gap-2 mb-5">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium uppercase">
                  {program.degree_type}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {program.duration_years} years
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize">
                  {program.mode.replace('_', ' ')}
                </span>
                {program.accreditation_status && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                    {program.accreditation_status}
                  </span>
                )}
              </div>

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

                <Button size="sm">Apply Now</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Program Description</h2>
              <div className="prose prose-sm max-w-none text-gray-700">
                {program.description ? (
                  <p className="whitespace-pre-line">{program.description}</p>
                ) : (
                  <p className="text-gray-500 italic">
                    Comprehensive program details will be available soon. Contact the institution for more information.
                  </p>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-sm p-6" data-testid="program-requirements">
              <h2 className="text-xl font-semibold mb-4">Admission Requirements</h2>
              <div className="space-y-4">
                {program.cutoff_score ? (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">JAMB Cut-off Score</p>
                      <p className="text-sm text-gray-600">Minimum score of {program.cutoff_score} required</p>
                    </div>
                  </div>
                ) : null}

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">O'Level Requirements</p>
                    <p className="text-sm text-gray-600">
                      Five credit passes including Mathematics and English Language in WAEC/NECO/NABTEB.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Additional Requirements</p>
                    <p className="text-sm text-gray-600">
                      Check with the institution for program-specific requirements and subject combinations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Career Prospects */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Career Prospects</h2>
              <p className="text-gray-700 leading-relaxed">
                Graduates of {program.name} have diverse career opportunities in various sectors.
                Career guidance and placement support are available through the institution.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4 text-gray-900">Key Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Duration</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {program.duration_years} years
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Tuition (per year)</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {program.tuition_per_year > 0 ? `₦${program.tuition_per_year.toLocaleString()}` : 'Contact Institution'}
                    </p>
                  </div>
                </div>

                {program.acceptance_fee && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Acceptance Fee</p>
                      <p className="text-sm font-semibold text-gray-900">
                        ₦{program.acceptance_fee.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {program.cutoff_score && (
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Cut-off Score</p>
                      <p className="text-sm font-semibold text-gray-900">{program.cutoff_score}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Degree Type</p>
                    <p className="text-sm font-semibold text-gray-900 uppercase">
                      {program.degree_type}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-gray-900">
                <Calendar className="h-5 w-5" />
                Application Timeline
              </h3>

              {isLoadingDeadlines ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              ) : activeDeadline ? (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs font-medium text-blue-900 uppercase mb-1">Application Opens</p>
                    <p className="text-sm text-blue-700 font-semibold">
                      {new Date(activeDeadline.application_start).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-xs font-medium text-red-900 uppercase mb-1">Application Closes</p>
                    <p className="text-sm text-red-700 font-semibold">
                      {new Date(activeDeadline.application_end).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  {activeDeadline.screening_date && (
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <p className="text-xs font-medium text-purple-900 uppercase mb-1">Screening Date</p>
                      <p className="text-sm text-purple-700 font-semibold">
                        {new Date(activeDeadline.screening_date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                  <div className="mt-2 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activeDeadline.status === 'open' ? 'bg-green-100 text-green-800' :
                      activeDeadline.status === 'closing_soon' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      Status: {activeDeadline.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 mb-4">
                    No active application window found for this program.
                  </p>
                  <Button className="w-full" variant="outline" size="sm">
                    Set Reminder
                  </Button>
                </div>
              )}
            </div>

            {/* Cost Calculator */}
            <div className="bg-white rounded-lg shadow-sm p-6" data-testid="program-tuition-detail">
              <h3 className="font-semibold mb-4 text-gray-900">Total Program Cost</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tuition ({program.duration_years} years)</span>
                  <span className="font-medium text-gray-900">
                    ₦{(program.tuition_per_year * program.duration_years).toLocaleString()}
                  </span>
                </div>
                {program.acceptance_fee && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Acceptance Fee</span>
                    <span className="font-medium text-gray-900">₦{program.acceptance_fee.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Estimated Cost</span>
                    <span className="font-bold text-lg text-primary">
                      ₦
                      {(
                        program.tuition_per_year * program.duration_years +
                        (program.acceptance_fee || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 italic">
                * Excludes accommodation, feeding, and other personal expenses
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ProgramDetailPage.displayName = 'ProgramDetailPage';
