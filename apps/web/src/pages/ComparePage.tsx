import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useComparisonStore } from '@/stores/comparisonStore';
import { Button } from '@admitly/ui';
import { GitCompare, X, CheckCircle, XCircle } from 'lucide-react';
import { mockPrograms, mockInstitutions } from '@/lib/mockData';
import type { Program, Institution } from '@admitly/types';

export const ComparePage: FC = () => {
  const { items, removeItem, clear } = useComparisonStore();

  const comparisonData = items.map((item) => {
    if (item.type === 'program') {
      const programData = mockPrograms.find((p) => p.id === item.id);
      return {
        ...item,
        data: programData,
      };
    } else {
      const institutionData = mockInstitutions.find((i) => i.id === item.id);
      return {
        ...item,
        data: institutionData,
      };
    }
  });

  const programs = comparisonData.filter(
    (item) => item.type === 'program' && item.data
  ) as Array<{ id: string; type: 'program'; addedAt: string; data: Program }>;

  const institutions = comparisonData.filter(
    (item) => item.type === 'institution' && item.data
  ) as Array<{ id: string; type: 'institution'; addedAt: string; data: Institution }>;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <GitCompare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No items to compare</h2>
          <p className="text-gray-600 mb-6">
            Add programs or institutions to your comparison list to get started
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild>
              <Link to="/programs">Browse Programs</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/institutions">Browse Institutions</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Compare</h1>
              <p className="text-gray-600 mt-1">
                Side-by-side comparison of {items.length} item{items.length > 1 ? 's' : ''}
              </p>
            </div>
            {items.length > 0 && (
              <Button variant="outline" onClick={clear}>
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Program Comparison */}
        {programs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Programs</h2>
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-700 bg-gray-50">
                      Feature
                    </th>
                    {programs.map((item) => (
                      <th key={item.id} className="p-4 text-left min-w-[250px]">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link
                              to={`/programs/${item.data?.slug}`}
                              className="font-semibold text-gray-900 hover:text-primary"
                            >
                              {item.data?.name}
                            </Link>
                            <p className="text-sm text-gray-600 mt-1">
                              {item.data?.institution?.name}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-700 bg-gray-50">Degree Type</td>
                    {programs.map((item) => (
                      <td key={item.id} className="p-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                          {item.data?.degree_type}
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-700 bg-gray-50">Duration</td>
                    {programs.map((item) => (
                      <td key={item.id} className="p-4">
                        {item.data?.duration_years} years
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-700 bg-gray-50">Mode</td>
                    {programs.map((item) => (
                      <td key={item.id} className="p-4 capitalize">
                        {item.data?.mode}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-700 bg-gray-50">Tuition (per year)</td>
                    {programs.map((item) => (
                      <td key={item.id} className="p-4 font-semibold text-primary">
                        ₦{item.data?.tuition_per_year.toLocaleString()}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-700 bg-gray-50">Acceptance Fee</td>
                    {programs.map((item) => (
                      <td key={item.id} className="p-4">
                        {item.data?.acceptance_fee
                          ? `₦${item.data.acceptance_fee.toLocaleString()}`
                          : 'N/A'}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-700 bg-gray-50">Cut-off Score</td>
                    {programs.map((item) => (
                      <td key={item.id} className="p-4">
                        {item.data?.cutoff_score || 'N/A'}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-700 bg-gray-50">Accreditation</td>
                    {programs.map((item) => (
                      <td key={item.id} className="p-4">
                        {item.data?.accreditation_status ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span>{item.data.accreditation_status}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                            <XCircle className="h-4 w-4" />
                            <span>Not specified</span>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-medium text-gray-700 bg-gray-50">Total Cost</td>
                    {programs.map((item) => (
                      <td key={item.id} className="p-4 font-bold text-lg text-primary">
                        ₦
                        {(
                          (item.data?.tuition_per_year || 0) *
                            (item.data?.duration_years || 0) +
                          (item.data?.acceptance_fee || 0)
                        ).toLocaleString()}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Institution Comparison */}
        {institutions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Institutions</h2>
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 font-semibold text-gray-700 bg-gray-50">
                      Feature
                    </th>
                    {institutions.map((item) => (
                      <th key={item.id} className="p-4 text-left min-w-[250px]">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link
                              to={`/institutions/${item.data?.slug}`}
                              className="font-semibold text-gray-900 hover:text-primary"
                            >
                              {item.data?.name}
                            </Link>
                            <p className="text-sm text-gray-600 mt-1">{item.data?.short_name}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-700 bg-gray-50">Type</td>
                    {institutions.map((item) => (
                      <td key={item.id} className="p-4 capitalize">
                        {item.data?.type.replace(/_/g, ' ')}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-700 bg-gray-50">Location</td>
                    {institutions.map((item) => (
                      <td key={item.id} className="p-4">
                        {item.data?.city}, {item.data?.state}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-700 bg-gray-50">Total Programs</td>
                    {institutions.map((item) => (
                      <td key={item.id} className="p-4 font-semibold">
                        {item.data?.program_count}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-700 bg-gray-50">Verification</td>
                    {institutions.map((item) => (
                      <td key={item.id} className="p-4">
                        {item.data?.verified ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span>Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                            <XCircle className="h-4 w-4" />
                            <span>Not verified</span>
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="p-4 font-medium text-gray-700 bg-gray-50">Website</td>
                    {institutions.map((item) => (
                      <td key={item.id} className="p-4">
                        {item.data?.website ? (
                          <a
                            href={item.data.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Visit Website
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ComparePage.displayName = 'ComparePage';
