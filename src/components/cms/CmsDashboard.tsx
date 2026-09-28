import { useState, useEffect } from 'react';
import {
  FileText,
  BookOpen,
  Image as ImageIcon,
  Inbox,
  PlusCircle,
  Clock,
  ArrowUpRight,
  Database,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Globe,
  UploadCloud,
  PanelBottom,
  Sliders,
} from 'lucide-react';
import { cmsStatsApi, cmsLiveSyncApi } from '../../lib/cms-client';
import type { ActivityLog } from '../../types/cms';

interface CmsDashboardProps {
  onNavigate: (section: string) => void;
}

export default function CmsDashboard({ onNavigate }: CmsDashboardProps) {
  const [stats, setStats] = useState<{
    totalPages: number;
    publishedPages: number;
    draftPages: number;
    totalArticles: number;
    publishedArticles: number;
    totalMedia: number;
    newInquiries: number;
  } | null>(null);

  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Live Sync State
  const [syncStatus, setSyncStatus] = useState<{
    canonicalUrl: string;
    isLiveInstance: boolean;
    lastSyncAt: string | null;
    lastSyncStatus: string;
    lastMessage: string;
  } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    loadSyncStatus();
  }, []);

  const loadSyncStatus = async () => {
    try {
      const res = await cmsLiveSyncApi.getStatus();
      setSyncStatus(res.status);
    } catch (_) {}
  };

  const handlePullFromLive = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await cmsLiveSyncApi.pullFromLive();
      setSyncFeedback(res.message);
      await loadStats();
      await loadSyncStatus();
      window.dispatchEvent(new CustomEvent('cms-page-saved'));
    } catch (err: any) {
      setSyncFeedback(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePushToLive = async () => {
    setIsPushing(true);
    setSyncFeedback(null);
    try {
      const res = await cmsLiveSyncApi.pushToLive();
      setSyncFeedback(res.message);
      await loadSyncStatus();
    } catch (err: any) {
      setSyncFeedback(`Push failed: ${err.message}`);
    } finally {
      setIsPushing(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await cmsStatsApi.get();
      setStats(data.stats);
      setRecentActivity(data.recentActivity);
    } catch (err) {
      console.error('Failed to load CMS stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Website Pages',
      value: stats?.totalPages ?? 0,
      sub: `${stats?.publishedPages ?? 0} Published • ${stats?.draftPages ?? 0} Draft`,
      icon: FileText,
      color: 'from-pink-500/20 to-rose-500/5',
      borderColor: 'border-pink-500/20',
      action: () => onNavigate('pages'),
    },
    {
      title: 'Articles / Editorial',
      value: stats?.totalArticles ?? 0,
      sub: `${stats?.publishedArticles ?? 0} Live on /blog`,
      icon: BookOpen,
      color: 'from-purple-500/20 to-indigo-500/5',
      borderColor: 'border-purple-500/20',
      action: () => onNavigate('articles'),
    },
    {
      title: 'Media Assets',
      value: stats?.totalMedia ?? 0,
      sub: '4K Images, Videos & Posters',
      icon: ImageIcon,
      color: 'from-amber-500/20 to-orange-500/5',
      borderColor: 'border-amber-500/20',
      action: () => onNavigate('media'),
    },
    {
      title: 'New Client Leads',
      value: stats?.newInquiries ?? 0,
      sub: 'Drawer inquiries awaiting review',
      icon: Inbox,
      color: 'from-emerald-500/20 to-teal-500/5',
      borderColor: 'border-emerald-500/20',
      action: () => onNavigate('inquiries'),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#18181f] via-[#15151c] to-[#121217] border border-white/10 p-6 sm:p-8 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#df0567]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#df0567]/15 border border-[#df0567]/30 text-[#df0567] text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Production Content Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ViralMuse Content Management
            </h2>
            <p className="text-sm text-white/60 mt-1 max-w-xl">
              Edit homepage sections, manage 4K media, publish blog articles, configure SEO, and review client inquiries in real time.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('pages-new')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-[#df0567]/25 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Page</span>
            </button>
            <button
              onClick={() => onNavigate('articles-new')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#df0567]" />
              <span>New Article</span>
            </button>
            <button
              onClick={() => onNavigate('media')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>Media Library</span>
            </button>
            <button
              onClick={() => onNavigate('footer')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              <PanelBottom className="w-4 h-4 text-[#df0567]" />
              <span>Footer &amp; Links</span>
            </button>
            <button
              onClick={() => onNavigate('inquiry-form')}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Inquiry Popup Form</span>
            </button>
          </div>
        </div>

        {/* Database Health Badge */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-white/60 gap-3">
          <div className="flex items-center space-x-2">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Database Status:</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 inline" /> Persistent &amp; Synced
            </span>
          </div>
          <div className="text-white/40">
            Changes saved here automatically update the live website without manual code rebuilds.
          </div>
        </div>
      </div>

      {/* Live Site Synchronization Bridge */}
      <div className="rounded-2xl bg-[#141419] border border-emerald-500/25 p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">Live Site CMS Synchronization</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Connected
                </span>
              </div>
              <p className="text-xs text-white/60 mt-0.5">
                Target Live Domain:{' '}
                <a
                  href={syncStatus?.canonicalUrl || 'https://viral-agency-cinematic-social-influencer-agency.ai.studio'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline font-mono"
                >
                  {syncStatus?.canonicalUrl || 'https://viral-agency-cinematic-social-influencer-agency.ai.studio'}
                </a>
              </p>
              {syncStatus?.lastSyncAt && (
                <p className="text-[11px] text-white/40 mt-0.5">
                  Last Synced:{' '}
                  <span className="text-white/70">
                    {new Date(syncStatus.lastSyncAt).toLocaleTimeString()} (
                    {new Date(syncStatus.lastSyncAt).toLocaleDateString()})
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {syncFeedback && (
              <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium">
                {syncFeedback}
              </span>
            )}

            <button
              onClick={handlePullFromLive}
              disabled={isSyncing}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/35 text-emerald-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Pulling Updates...' : 'Pull from Live Site'}</span>
            </button>

            <button
              onClick={handlePushToLive}
              disabled={isPushing}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/90 text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className={`w-3.5 h-3.5 ${isPushing ? 'animate-pulse text-[#df0567]' : ''}`} />
              <span>{isPushing ? 'Pushing Updates...' : 'Push to Live Site'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={card.action}
              className={`relative p-5 rounded-2xl bg-gradient-to-b ${card.color} bg-[#131317] border ${card.borderColor} hover:border-white/30 transition-all cursor-pointer group shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  {card.title}
                </span>
                <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-black text-white tabular-nums tracking-tight">
                  {isLoading ? '...' : card.value}
                </span>
                <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
              </div>

              <p className="text-[11px] text-white/50 mt-1">{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Quick Content Management & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Quick Sections */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-[#df0567]" />
                <span>Primary Website Pages</span>
              </h3>
              <button
                onClick={() => onNavigate('pages')}
                className="text-xs text-[#df0567] hover:underline font-semibold"
              >
                View All Pages →
              </button>
            </div>

            <div className="space-y-3">
              {/* Homepage Quick Editor Row */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#df0567]/15 border border-[#df0567]/30 flex items-center justify-center font-bold text-[#df0567]">
                    /
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Homepage (Main Cinematic Scrollytelling)</h4>
                    <p className="text-xs text-white/50">8 Custom Section Blocks • Live on Public Site</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold">
                    Published
                  </span>
                  <button
                    onClick={() => onNavigate('pages-home')}
                    className="px-3 py-1.5 rounded-lg bg-[#df0567] hover:bg-[#c4045a] text-white text-xs font-semibold cursor-pointer"
                  >
                    Edit Sections
                  </button>
                </div>
              </div>

              {/* Blog Index Row */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400">
                    /blog
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Editorial &amp; Articles Hub</h4>
                    <p className="text-xs text-white/50">{stats?.totalArticles ?? 0} Published Articles</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold">
                    Published
                  </span>
                  <button
                    onClick={() => onNavigate('articles')}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium cursor-pointer"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onNavigate('navigation')}
              className="p-4 rounded-xl bg-[#131317] border border-white/10 hover:border-white/20 text-left transition-all group"
            >
              <span className="text-xs font-semibold text-white group-hover:text-[#df0567] transition-colors block">
                Navigation Menu
              </span>
              <span className="text-[11px] text-white/50 block mt-1">Reorder header &amp; mobile links</span>
            </button>

            <button
              onClick={() => onNavigate('seo')}
              className="p-4 rounded-xl bg-[#131317] border border-white/10 hover:border-white/20 text-left transition-all group"
            >
              <span className="text-xs font-semibold text-white group-hover:text-[#df0567] transition-colors block">
                SEO &amp; OpenGraph
              </span>
              <span className="text-[11px] text-white/50 block mt-1">Social cards &amp; meta previews</span>
            </button>

            <button
              onClick={() => onNavigate('settings')}
              className="p-4 rounded-xl bg-[#131317] border border-white/10 hover:border-white/20 text-left transition-all group"
            >
              <span className="text-xs font-semibold text-white group-hover:text-[#df0567] transition-colors block">
                Site Settings
              </span>
              <span className="text-[11px] text-white/50 block mt-1">Contact email, address &amp; phone</span>
            </button>
          </div>
        </div>

        {/* Right 1 Col: Real-time Activity Logs */}
        <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-white/60" />
                <span>Recent Activity</span>
              </h3>
              <button
                onClick={() => onNavigate('activity')}
                className="text-xs text-white/50 hover:text-white"
              >
                View Full Log
              </button>
            </div>

            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <div className="py-8 text-center text-xs text-white/40">No activity logged yet.</div>
              ) : (
                recentActivity.slice(0, 6).map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                    <div className="flex items-center justify-between text-white/80 font-medium">
                      <span className="capitalize">{log.action.replace(/_/g, ' ').toLowerCase()}</span>
                      <span className="text-[10px] text-white/40">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/60 mt-1 truncate">{log.details || log.entityType}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-white/40">
            Secure Admin Session • Active
          </div>
        </div>
      </div>
    </div>
  );
}
