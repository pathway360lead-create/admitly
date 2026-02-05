import { FC } from 'react';
import { Home, FileText, Bookmark, Bell, GitCompare, Settings, LogOut, LucideIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
    icon: LucideIcon;
    label: string;
    id: string;
}

interface DashboardSidebarProps {
    activeTab: string;
    onTabChange: (tabId: any) => void;
    onLogout: () => void;
    mobileOpen?: boolean;
    onMobileClose?: () => void;
}

const items: SidebarItem[] = [
    { icon: Home, label: 'Dashboard', id: 'overview' },
    { icon: FileText, label: 'Applications', id: 'applications' },
    { icon: Bookmark, label: 'Scholarships', id: 'bookmarks' },
    { icon: GitCompare, label: 'Comparisons', id: 'comparisons' },
    { icon: Bell, label: 'Alerts', id: 'alerts' },
    { icon: Settings, label: 'Settings', id: 'settings' },
];

export const DashboardSidebar: FC<DashboardSidebarProps> = ({
    activeTab,
    onTabChange,
    onLogout,
    mobileOpen = false,
    onMobileClose
}) => {
    const handleTabClick = (tabId: string) => {
        onTabChange(tabId);
        // Close mobile menu after selection
        if (onMobileClose) {
            onMobileClose();
        }
    };

    const handleLogoutClick = () => {
        onLogout();
        // Close mobile menu after logout
        if (onMobileClose) {
            onMobileClose();
        }
    };

    // Sidebar content (shared between mobile and desktop)
    const sidebarContent = (
        <>
            <div className="p-6">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Menu</h2>
                <nav className="space-y-2">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleTabClick(item.id)}
                                className={cn(
                                    "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm text-left group",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                                )}
                            >
                                <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-gray-400 group-hover:text-primary")} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-gray-100">
                <button
                    onClick={handleLogoutClick}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
                >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar (hidden on mobile) */}
            <div className="w-64 bg-white h-[calc(100vh-4rem)] border-r border-gray-100 flex flex-col sticky top-16 hidden md:flex">
                {sidebarContent}
            </div>

            {/* Mobile Drawer (visible when mobileOpen is true) */}
            {mobileOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
                        onClick={onMobileClose}
                        aria-hidden="true"
                    />

                    {/* Drawer Panel */}
                    <div className="fixed inset-y-0 left-0 w-64 bg-white z-50 flex flex-col md:hidden shadow-xl transform transition-transform">
                        {/* Close Button */}
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">Dashboard Menu</h2>
                            <button
                                onClick={onMobileClose}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                aria-label="Close menu"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Sidebar Content */}
                        {sidebarContent}
                    </div>
                </>
            )}
        </>
    );
};
