import { FC, useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBookmarkStore } from '@/stores/bookmarkStore';
import { useComparisonStore } from '@/stores/comparisonStore';
import { Button } from '@admitly/ui';
import { DashboardSidebar, DashboardWelcome, DashboardStats } from '@/components/organisms';
import { School, GitCompare, Bell, FileText, Bookmark, Settings } from 'lucide-react';
import { mockPrograms, mockInstitutions } from '@/lib/mockData';

export const DashboardPage: FC = () => {
  const { profile, logout } = useAuth();
  const bookmarks = useBookmarkStore((state) => state.bookmarks);
  // const comparisonItems = useComparisonStore((state) => state.items); // Unused for now
  const [activeTab, setActiveTab] = useState('overview');
  const isLoggingOut = useRef(false);

  // Helper to handle tab changes from sidebar
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    if (isLoggingOut.current) {
      console.log('[DashboardPage] Logout already in progress, ignoring');
      return;
    }

    isLoggingOut.current = true;
    console.log('[DashboardPage] handleLogout called');

    try {
      console.log('[DashboardPage] Calling logout...');
      await logout();
      console.log('[DashboardPage] Logout successful, redirecting...');
      window.location.href = '/';
    } catch (error) {
      console.error('[DashboardPage] Logout error:', error);
    } finally {
      setTimeout(() => {
        isLoggingOut.current = false;
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (Hidden on mobile, defined in DashboardSidebar) */}
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <div className="container mx-auto px-4 py-8 md:px-8 max-w-6xl">

          {/* Header / Welcome Area */}
          <div className="mb-8">
            <DashboardWelcome userName={profile?.full_name || 'Student'} className="mb-8" />
          </div>

          {/* Tab Content */}
          <div className="space-y-6">

            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 font-heading">Your Progress</h2>
                  <DashboardStats />
                </div>

                {/* Recent Activity Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 font-heading">Recent Activity</h2>
                    <Button variant="link" className="text-primary">View All</Button>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {bookmarks.slice(0, 3).map((bookmark, i) => {
                      const item = bookmark.type === 'program'
                        ? mockPrograms.find((p) => p.id === bookmark.id)
                        : mockInstitutions.find((i) => i.id === bookmark.id);

                      return (
                        <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            {bookmark.type === 'program' ? <FileText size={18} /> : <School size={18} />}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">{item?.name || 'Unknown Item'}</p>
                            <p className="text-xs text-gray-500">Bookmarked on {new Date(bookmark.addedAt).toLocaleDateString()}</p>
                          </div>
                          <Button variant="ghost" size="sm">View</Button>
                        </div>
                      )
                    })}
                    {bookmarks.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        No recent activity yet. Start exploring!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* OTHER TABS (Simplified placeholders for now, keeping structure) */}
            {/* Note: In a full refactor, these would be separate components too */}
            {activeTab !== 'overview' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
                <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  {activeTab === 'applications' && <FileText className="h-10 w-10 text-gray-400" />}
                  {activeTab === 'bookmarks' && <Bookmark className="h-10 w-10 text-gray-400" />}
                  {activeTab === 'comparisons' && <GitCompare className="h-10 w-10 text-gray-400" />}
                  {activeTab === 'alerts' && <Bell className="h-10 w-10 text-gray-400" />}
                  {activeTab === 'settings' && <Settings className="h-10 w-10 text-gray-400" />}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 capitalize mb-2">{activeTab}</h2>
                <p className="text-gray-500 max-w-md">
                  This section is currently under development as part of the new design system.
                  Check back soon for the full {activeTab} experience!
                </p>
                <Button className="mt-6" onClick={() => setActiveTab('overview')}>
                  Return to Dashboard
                </Button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

DashboardPage.displayName = 'DashboardPage';
