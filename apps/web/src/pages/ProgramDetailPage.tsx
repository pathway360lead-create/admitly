import { FC } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { useComparisonStore } from '@/stores/comparisonStore';
import { useProgramDetail } from '@/hooks/api';
import { Button } from '@admitly/ui';
import {
  Bookmark,
  GitCompare,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Calendar,
  GraduationCap,
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

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 bg-gray-200 animate-pulse rounded-lg mx-auto mb-4" />
          <p className="text-gray-600">Loading program details...</p>
        </div>
      </div>
    );
  }

  // Handle error or not found
  if (isError || !program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
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
    <div className="min-h-screen bg-gray-50">
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
          <span className="text-gray-900">{program.name}</span>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="h-24 w-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-12 w-12 text-primary" />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{program.name}</h1>
              <Link
                to={`/institutions/${program.institution?.slug}`}
                className="text-lg text-primary hover:underline mb-4 inline-block"
              >
                {program.institution?.name}
              </Link>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {program.degree_type}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {program.duration_years} years
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {program.mode}
                </span>
                {program.accreditation_status && (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                    {program.accreditation_status}
                  </span>
                )}
              </div>

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

                <Button>Apply Now</Button>
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
              <p className="text-gray-700 leading-relaxed">
                {program.description ||
                  'Comprehensive program details will be available soon. Contact the institution for more information.'}
              </p>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Admission Requirements</h2>
              <div className="space-y-3">
                {program.cutoff_score && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">JAMB Cut-off Score</p>
                      <p className="text-sm text-gray-600">{program.cutoff_score} and above</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">O'Level Requirements</p>
                    <p className="text-sm text-gray-600">
                      Five credit passes including Mathematics and English Language
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Additional Requirements</p>
                    <p className="text-sm text-gray-600">
                      Check with the institution for program-specific requirements
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Career Prospects */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Career Prospects</h2>
              <p className="text-gray-700">
                Graduates of this program have diverse career opportunities in various sectors.
                Career guidance and placement support are available through the institution.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">Key Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {program.duration_years} years
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Tuition (per year)</p>
                    <p className="text-sm font-semibold text-gray-900">
                      ₦{program.tuition_per_year.toLocaleString()}
                    </p>
                  </div>
                </div>

                {program.acceptance_fee && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Acceptance Fee</p>
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
                      <p className="text-sm text-gray-600">Cut-off Score</p>
                      <p className="text-sm font-semibold text-gray-900">{program.cutoff_score}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Degree Type</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {program.degree_type.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Timeline */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Application Timeline
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Application Opens</p>
                  <p className="text-sm text-blue-700">March 2025</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900">Application Closes</p>
                  <p className="text-sm text-green-700">May 2025</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-900">Screening Date</p>
                  <p className="text-sm text-purple-700">June 2025</p>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                Set Reminder
              </Button>
            </div>

            {/* Cost Calculator */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4">Total Program Cost</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tuition ({program.duration_years} years)</span>
                  <span className="font-medium">
                    ₦{(program.tuition_per_year * program.duration_years).toLocaleString()}
                  </span>
                </div>
                {program.acceptance_fee && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Acceptance Fee</span>
                    <span className="font-medium">₦{program.acceptance_fee.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Estimated Cost</span>
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
              <p className="text-xs text-gray-500">
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
