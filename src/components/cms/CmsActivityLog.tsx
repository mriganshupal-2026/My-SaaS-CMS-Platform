import { useState, useEffect } from 'react';
import { Activity, Search, ShieldCheck, Clock, User } from 'lucide-react';
import { cmsActivityApi } from '../../lib/cms-client';
import type { ActivityLog } from '../../types/cms';

export default function CmsActivityLog() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await cmsActivityApi.getLogs(200);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.username.toLowerCase().includes(search.toLowerCase()) ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.details && l.details.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Audit &amp; Activity Log</h2>
        <p className="text-xs sm:text-sm text-white/60 mt-0.5">
          Immutable chronological history of all content mutations, publishing actions, and admin logins.
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[#131317] border border-white/10 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-hidden focus:border-[#df0567]"
          />
        </div>

        <span className="text-xs text-white/40">{filteredLogs.length} events recorded</span>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-[#131317] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[11px] uppercase tracking-wider text-white/50 font-semibold">
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Admin User</th>
                <th className="px-6 py-3.5">Action Event</th>
                <th className="px-6 py-3.5">Entity</th>
                <th className="px-6 py-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                    Loading audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                    No activity logs recorded.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-white/50 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                          {log.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-white">{log.username}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#df0567]/15 text-[#df0567] font-semibold text-[11px] uppercase font-mono">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-white/70 uppercase text-[11px] font-mono">
                      {log.entityType}
                    </td>

                    <td className="px-6 py-4 text-xs text-white/80 max-w-md truncate">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
