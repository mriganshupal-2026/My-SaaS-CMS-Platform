import React, { useState, useEffect, type MouseEvent } from 'react';
import {
  Inbox,
  Search,
  Mail,
  Building,
  DollarSign,
  Calendar,
  CheckCircle2,
  Archive,
  Clock,
  Phone,
  Sliders,
  Eye,
  X,
  Copy,
  Check,
  Send,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { cmsInquiriesApi } from '../../lib/cms-client';
import type { ProjectInquiry } from '../../types/cms';

interface CmsInquiriesListProps {
  onNavigate?: (section: string) => void;
}

export default function CmsInquiriesList({ onNavigate }: CmsInquiriesListProps) {
  const [inquiries, setInquiries] = useState<ProjectInquiry[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'NEW' | 'CONTACTED' | 'ARCHIVED'>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<ProjectInquiry | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    setIsLoading(true);
    try {
      const data = await cmsInquiriesApi.getAll();
      setInquiries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: ProjectInquiry['status'], e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await cmsInquiriesApi.updateStatus(id, status);
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
      );
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  const copyToClipboard = (text: string, fieldKey: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.name.toLowerCase().includes(search.toLowerCase()) ||
      inq.email.toLowerCase().includes(search.toLowerCase()) ||
      (inq.company && inq.company.toLowerCase().includes(search.toLowerCase())) ||
      inq.message.toLowerCase().includes(search.toLowerCase()) ||
      (inq.service && inq.service.toLowerCase().includes(search.toLowerCase()));

    const matchesFilter = filter === 'ALL' || inq.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Project Inquiries</h2>
          <p className="text-xs sm:text-sm text-white/60 mt-0.5">
            Review VIP brand and luxury resort consultation submissions from the public website drawer. Click any inquiry to view details.
          </p>
        </div>

        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('inquiry-form')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer self-start sm:self-auto shadow-md"
          >
            <Sliders className="w-4 h-4 text-[#df0567]" />
            <span>Customize Popup Form</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#131317] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search inquiries by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-hidden focus:border-[#df0567]"
          />
        </div>

        <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-xl border border-white/10 self-stretch sm:self-auto justify-center">
          {(['ALL', 'NEW', 'CONTACTED', 'ARCHIVED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === tab ? 'bg-[#df0567] text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries Cards Stream */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-16 text-center text-white/40 text-sm">Loading inquiries...</div>
        ) : filteredInquiries.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#131317] border border-white/10 text-center text-white/40 text-sm">
            No inquiries matching your criteria.
          </div>
        ) : (
          filteredInquiries.map((inq) => (
            <div
              key={inq.id}
              onClick={() => setSelectedInquiry(inq)}
              className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4 shadow-lg hover:border-[#df0567]/50 hover:bg-[#18181d] transition-all cursor-pointer group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="font-bold text-base text-white group-hover:text-[#f9b8d2] transition-colors">
                      {inq.name}
                    </h3>
                    {inq.status === 'NEW' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#df0567]/20 text-[#df0567] text-[10px] font-bold uppercase tracking-wider border border-[#df0567]/30">
                        New
                      </span>
                    )}
                    {inq.status === 'CONTACTED' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                        Contacted
                      </span>
                    )}
                    {inq.status === 'ARCHIVED' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/50 text-[10px] font-bold uppercase tracking-wider">
                        Archived
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/60 mt-1.5">
                    <span className="flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-white/40" />
                      <span>{inq.email}</span>
                    </span>
                    {inq.company && (
                      <div className="flex items-center space-x-1">
                        <Building className="w-3.5 h-3.5 text-white/40" />
                        <span>{inq.company}</span>
                      </div>
                    )}
                    {inq.phone && (
                      <div className="flex items-center space-x-1 text-white/80">
                        <Phone className="w-3.5 h-3.5 text-[#df0567]" />
                        <span>{inq.phone}</span>
                      </div>
                    )}
                    {inq.budget && (
                      <div className="flex items-center space-x-1 text-emerald-400 font-medium">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{inq.budget}</span>
                      </div>
                    )}
                    {inq.service && (
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/80 text-[11px] border border-white/10">
                        {inq.service}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  <div className="text-[11px] text-white/40 flex items-center space-x-1 mr-2">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedInquiry(inq);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#df0567]" />
                    <span>View Details</span>
                  </button>

                  {inq.status !== 'CONTACTED' && (
                    <button
                      type="button"
                      onClick={(e) => updateStatus(inq.id, 'CONTACTED', e)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Contacted</span>
                    </button>
                  )}

                  {inq.status !== 'ARCHIVED' && (
                    <button
                      type="button"
                      onClick={(e) => updateStatus(inq.id, 'ARCHIVED', e)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Archive</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-xs sm:text-sm text-white/80 leading-relaxed font-sans line-clamp-2">
                {inq.message}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Inquiry Detail Modal / Drawer */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#131317] border border-white/15 rounded-2xl shadow-2xl text-white p-6 sm:p-8 space-y-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                    Inquiry ID: {selectedInquiry.id}
                  </span>
                  {selectedInquiry.status === 'NEW' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#df0567]/20 text-[#df0567] text-[10px] font-bold uppercase tracking-wider border border-[#df0567]/30">
                      New
                    </span>
                  )}
                  {selectedInquiry.status === 'CONTACTED' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                      Contacted
                    </span>
                  )}
                  {selectedInquiry.status === 'ARCHIVED' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/50 text-[10px] font-bold uppercase tracking-wider">
                      Archived
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-white">{selectedInquiry.name}</h3>
                <p className="text-xs text-white/50 flex items-center gap-1.5 pt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Submitted on {new Date(selectedInquiry.createdAt).toLocaleString()}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">
                  Email Address
                </span>
                <div className="flex items-center justify-between">
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="text-white font-semibold hover:text-[#df0567] transition-colors truncate mr-2"
                  >
                    {selectedInquiry.email}
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedInquiry.email, 'email')}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 cursor-pointer"
                    title="Copy email"
                  >
                    {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">
                  Phone / WhatsApp
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">
                    {selectedInquiry.phone || 'Not provided'}
                  </span>
                  {selectedInquiry.phone && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedInquiry.phone!, 'phone')}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/80 cursor-pointer"
                      title="Copy phone"
                    >
                      {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">
                  Company / Property
                </span>
                <span className="text-white font-semibold block truncate">
                  {selectedInquiry.company || 'Independent / Individual'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">
                  Estimated Budget Range
                </span>
                <span className="text-emerald-400 font-bold block">
                  {selectedInquiry.budget || 'Not specified'}
                </span>
              </div>
            </div>

            {/* Requested Services */}
            {selectedInquiry.service && (
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">
                  Requested Services &amp; Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedInquiry.service.split(',').map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-xs font-medium border border-white/15"
                    >
                      {s.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Full Message / Brief */}
            <div className="p-5 rounded-xl bg-black/50 border border-white/10 space-y-2">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#df0567]" />
                <span>Full Project Brief / Message</span>
              </span>
              <p className="text-sm text-white/90 leading-relaxed font-sans whitespace-pre-wrap">
                {selectedInquiry.message}
              </p>
            </div>

            {/* Workflow Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {selectedInquiry.status !== 'CONTACTED' && (
                  <button
                    type="button"
                    onClick={(e) => updateStatus(selectedInquiry.id, 'CONTACTED', e)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Contacted</span>
                  </button>
                )}

                {selectedInquiry.status !== 'ARCHIVED' && (
                  <button
                    type="button"
                    onClick={(e) => updateStatus(selectedInquiry.id, 'ARCHIVED', e)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Archive className="w-4 h-4" />
                    <span>Archive Inquiry</span>
                  </button>
                )}

                {selectedInquiry.status !== 'NEW' && (
                  <button
                    type="button"
                    onClick={(e) => updateStatus(selectedInquiry.id, 'NEW', e)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-semibold text-xs cursor-pointer transition-colors"
                  >
                    Mark New
                  </button>
                )}
              </div>

              <a
                href={`mailto:${selectedInquiry.email}?subject=Regarding your ViralMuse Project Inquiry (${selectedInquiry.name})`}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Mail className="w-4 h-4" />
                <span>Reply via Email</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
