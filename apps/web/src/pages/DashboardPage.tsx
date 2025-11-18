import { FC, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { useComparisonStore } from '@/stores/comparisonStore';
import { Button } from '@admitly/ui';
import {
  LayoutDashboard,
  Bookmark,
  FileText,
  Bell,
  GitCompare,
  Settings,
  Crown,
  TrendingUp,
  Calendar,
  School,
} from 'lucide-react';
import { mockPrograms, mockInstitutions } from '@/lib/mockData';

type TabType = 'overview' | 'bookmarks' | 'applications' | 'alerts' | 'comparisons' | 'settings';

export const DashboardPage: FC = () => {
  const { profile } = useAuth();
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  const comparisonItems = useComparisonStore((state) => state.items);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'bookmarks' as const, label: 'My Bookmarks', icon: Bookmark },
    { id: 'applications' as const, label: 'Applications', icon: FileText },
    { id: 'alerts' as const, label: 'Alerts', icon: Bell },
    { id: 'comparisons' as const, label: 'Comparisons', icon: GitCompare },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  const isPremium = profile?.subscription_status === ('premium' as any);

  // Get bookmarked items
  const bookmarkedPrograms = bookmarks
    .filter((b) => b.type === 'program')
    .map((b) => mockPrograms.find((p) => p.id === b.id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  const bookmarkedInstitutions = bookmarks
    .filter((b) => b.type === 'institution')
    .map((b) => mockInstitutions.find((i) => i.id === b.id))
    .filter((i): i is NonNullable<typeof i> => i !== undefined);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || 'Student'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your educational journey from one place
          </p>
        </div>

        {/* Subscription Banner */}
        {!isPremium && (
          <div className="mb-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8" />
                <div>
                  <h3 className="text-lg font-semibold">Upgrade to Premium</h3>
                  <p className="text-purple-100 text-sm">
                    Get AI-powered recommendations, unlimited comparisons, and priority support
                  </p>
                </div>
              </div>
              <Button variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
                Upgrade Now
              </Button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Bookmarks</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">{bookmarks.length}</p>
                      </div>
                      <Bookmark className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Comparisons</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">
                          {comparisonItems.length}
                        </p>
                      </div>
                      <GitCompare className="h-8 w-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Applications</p>
                        <p className="text-2xl font-bold text-purple-900 mt-1">0</p>
                      </div>
                      <FileText className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {bookmarks.slice(0, 5).map((bookmark) => {
                      const item =
                        bookmark.type === 'program'
                          ? mockPrograms.find((p) => p.id === bookmark.id)
                          : mockInstitutions.find((i) => i.id === bookmark.id);

                      return (
                        <div
                          key={`${bookmark.type}-${bookmark.id}`}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <School className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Bookmarked {item?.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(bookmark.addedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {bookmarks.length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        No recent activity. Start exploring programs and institutions!
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <a
                      href="/programs"
                      className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all text-center"
                    >
                      <School className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">Browse Programs</p>
                    </a>
                    <a
                      href="/institutions"
                      className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all text-center"
                    >
                      <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">View Institutions</p>
                    </a>
                    <a
                      href="/compare"
                      className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all text-center"
                    >
                      <GitCompare className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">Compare Programs</p>
                    </a>
                    <a
                      href="/deadlines"
                      className="p-4 bg-white border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all text-center"
                    >
                      <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">View Deadlines</p>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Bookmarks Tab */}
            {activeTab === 'bookmarks' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Bookmarked Programs</h3>
                  {bookmarkedPrograms.length > 0 ? (
                    <div className="grid gap-4">
                      {bookmarkedPrograms.map((program) => (
                        <div
                          key={program.id}
                          className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">{program.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {program.institution?.name}
                              </p>
                              <div className="flex gap-2 mt-2">
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                  {program.degree_type}
                                </span>
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                  {program.duration_years} years
                                </span>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={`/programs/${program.slug}`}>View Details</a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No bookmarked programs yet</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Bookmarked Institutions</h3>
                  {bookmarkedInstitutions.length > 0 ? (
                    <div className="grid gap-4">
                      {bookmarkedInstitutions.map((institution) => (
                        <div
                          key={institution.id}
                          className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-gray-900">{institution.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {institution.city}, {institution.state}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">
                                {institution.program_count} programs available
                              </p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={`/institutions/${institution.slug}`}>View Details</a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No bookmarked institutions yet
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No applications yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Track your application progress and deadlines here
                </p>
                <Button asChild>
                  <a href="/programs">Browse Programs</a>
                </Button>
              </div>
            )}

            {/* Alerts Tab */}
            {activeTab === 'alerts' && (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No alerts configured</h3>
                <p className="text-gray-600 mb-6">
                  Set up alerts for application deadlines and important updates
                </p>
                <Button>Configure Alerts</Button>
              </div>
            )}

            {/* Comparisons Tab */}
            {activeTab === 'comparisons' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Saved Comparisons</h3>
                  {comparisonItems.length > 0 && (
                    <Button asChild>
                      <a href="/compare">View Comparison</a>
                    </Button>
                  )}
                </div>

                {comparisonItems.length > 0 ? (
                  <div className="grid gap-3">
                    {comparisonItems.map((item) => {
                      const data =
                        item.type === 'program'
                          ? mockPrograms.find((p) => p.id === item.id)
                          : mockInstitutions.find((i) => i.id === item.id);

                      return (
                        <div
                          key={item.id}
                          className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                        >
                          <p className="font-medium text-gray-900">{data?.name || 'Unknown'}</p>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {item.type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <GitCompare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No items in comparison</p>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={profile?.full_name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        defaultValue={profile?.email}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <input
                        type="text"
                        defaultValue={profile?.role}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Subscription</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">
                          {isPremium ? 'Premium' : 'Free'} Plan
                        </p>
                        <p className="text-sm text-gray-600">
                          {isPremium
                            ? 'You have access to all premium features'
                            : 'Upgrade to unlock premium features'}
                        </p>
                      </div>
                      {!isPremium && <Button>Upgrade</Button>}
                    </div>
                  </div>
                </div>

                <div>
                  <Button variant="outline" className="w-full">
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

DashboardPage.displayName = 'DashboardPage';
