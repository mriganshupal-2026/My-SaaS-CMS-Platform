import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Image as ImageIcon,
  Menu as MenuIcon,
  PanelBottom,
  Sliders,
  Globe,
  Inbox,
  Settings,
  CornerDownRight,
  Activity,
  LogOut,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  X,
  RefreshCw,
  Check,
  Package,
} from 'lucide-react';
import type { User } from '../../types/cms';
import { cmsLiveSyncApi } from '../../lib/cms-client';

interface CmsLayoutProps {
  user: User;
  currentSection: string;
  onNavigate: (section: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function CmsLayout({
  user,
  currentSection,
  onNavigate,
  onLogout,
  children,
}: CmsLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  const handleLiveSync = async () => {
    setIsSyncing(true);
    setSyncToast(null);
    try {
      const res = await cmsLiveSyncApi.pullFromLive();
      setSyncToast(res.message || 'Synced successfully!');
      // Dispatch event to inform any open editor or page to refresh
      window.dispatchEvent(new CustomEvent('cms-page-saved'));
      setTimeout(() => setSyncToast(null), 4000);
    } catch (err: any) {
      setSyncToast(`Sync error: ${err.message || 'Failed'}`);
      setTimeout(() => setSyncToast(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Close mobile sidebar on navigation
  const handleNavClick = (section: string) => {
    onNavigate(section);
    setIsSidebarOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'articles', label: 'Editorial / Blog', icon: BookOpen },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'navigation', label: 'Navigation Menu', icon: MenuIcon },
    { id: 'footer', label: 'Footer & Links', icon: PanelBottom },
    { id: 'inquiry-form', label: 'Inquiry Popup Form', icon: Sliders },
    { id: 'seo', label: 'SEO & Metadata', icon: Globe },
    { id: 'inquiries', label: 'Project Inquiries', icon: Inbox },
    { id: 'users', label: 'Team & Permissions', icon: ShieldCheck },
    { id: 'settings', label: 'Site Settings', icon: Settings },
    { id: 'redirects', label: 'URL Redirects', icon: CornerDownRight },
    { id: 'activity', label: 'Activity Logs', icon: Activity },
    { id: 'boilerplate', label: 'Boilerplate & SaaS Manual', icon: Package },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d10] text-[#f1f1f5] flex flex-col md:flex-row antialiased selection:bg-[#df0567] selection:text-white font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#131317] border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#df0567] flex items-center justify-center font-bold text-white shadow-md">
            V
          </div>
          <div>
            <span className="font-headline text-xl text-[#df0567] tracking-tight uppercase leading-[0.82] font-black block">
              ViralMuse
            </span>
            <span className="font-script text-[11px] text-[#df0567] font-bold tracking-tight lowercase block">
              social media agency
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-xs"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#131317] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="px-6 py-6 border-b border-white/10 hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#df0567] to-[#9b0348] flex items-center justify-center font-black text-white shadow-lg">
                V
              </div>
              <div>
                <span className="font-headline text-2xl text-[#df0567] tracking-tight uppercase leading-[0.82] font-black drop-shadow-sm block">
                  ViralMuse
                </span>
                <span className="font-script text-xs text-[#df0567] font-bold tracking-tight lowercase leading-none block mt-1">
                  social media agency
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-white/40 font-bold">
              Content Management
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentSection === item.id ||
                (item.id === 'pages' && currentSection.startsWith('pages')) ||
                (item.id === 'articles' && currentSection.startsWith('articles'));

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#df0567] text-white shadow-[0_2px_12px_rgba(223,5,103,0.3)]'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/50'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User Profile & Actions */}
        <div className="p-3 border-t border-white/10 bg-black/20">
          <div className="px-3 py-2 flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <span className="block text-xs font-semibold text-white truncate">{user.username}</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3 h-3 inline" /> {user.role}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <ExternalLink className="w-3.5 h-3.5 text-[#df0567]" />
                <span>View Live Site</span>
              </div>
              <span className="text-[10px] text-white/40">Public</span>
            </a>

            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Top Sub-Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-[#131317]/60 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
          <div className="flex items-center space-x-2 text-xs text-white/50">
            <span className="text-white/70">ViralMuse CMS</span>
            <span>/</span>
            <span className="text-white font-medium capitalize">{currentSection.replace(/-/g, ' ')}</span>
          </div>

          <div className="flex items-center space-x-3">
            {syncToast && (
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md flex items-center gap-1 font-medium">
                <Check className="w-3 h-3" /> {syncToast}
              </span>
            )}

            <button
              onClick={handleLiveSync}
              disabled={isSyncing}
              title="Pull latest CMS updates from the live site"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-400 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Live Updates'}</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-colors"
            >
              <span>Live Website</span>
              <ExternalLink className="w-3 h-3 text-[#df0567]" />
            </a>

            <div className="h-4 w-px bg-white/10" />

            <div className="text-xs text-right">
              <span className="text-white/60">Signed in as </span>
              <span className="font-semibold text-white">{user.username}</span>
            </div>
          </div>
        </header>

        {/* Dynamic CMS View Component */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</div>
      </main>
    </div>
  );
}
