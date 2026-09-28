import { useState, useEffect } from 'react';
import {
  PlusCircle,
  Search,
  FileText,
  Copy,
  Trash2,
  Edit,
  ExternalLink,
  Home,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { cmsPagesApi } from '../../lib/cms-client';
import type { Page, PageSection } from '../../types/cms';
import CmsSectionTemplateModal from './CmsSectionTemplateModal';
import type { PageStarterTemplate } from '../../lib/sectionTemplates';

interface CmsPagesListProps {
  onEditPage: (pageId: string) => void;
  onCreatePage: () => void;
}

export default function CmsPagesList({ onEditPage, onCreatePage }: CmsPagesListProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isCreatingWithTemplate, setIsCreatingWithTemplate] = useState(false);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setIsLoading(true);
    try {
      const allPages = await cmsPagesApi.getAll();
      setPages(allPages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFromSection = async (section: PageSection) => {
    setIsCreatingWithTemplate(true);
    try {
      const timestamp = Date.now().toString(36).slice(-4);
      const title = `${section.title || section.type} Campaign`;
      const slug = `${section.type}-${timestamp}`;
      const newPage = await cmsPagesApi.create({
        title,
        slug,
        status: 'DRAFT',
        isHomepage: false,
        sections: [section],
        seo: {
          title: `${title} | ViralMuse`,
          description: `ViralMuse ${title} page featuring ${section.type} scrollytelling section.`,
          ogImage: '/og-image.jpg',
        },
      });
      setPages((prev) => [newPage, ...prev]);
      onEditPage(newPage.id);
    } catch (err: any) {
      alert(err.message || 'Failed to create page from section template');
    } finally {
      setIsCreatingWithTemplate(false);
    }
  };

  const handleCreateFromPageTemplate = async (tpl: PageStarterTemplate) => {
    setIsCreatingWithTemplate(true);
    try {
      const timestamp = Date.now().toString(36).slice(-4);
      const title = tpl.name;
      const slug = `${tpl.recommendedSlug}-${timestamp}`;
      const sections = tpl.generateSections();
      const newPage = await cmsPagesApi.create({
        title,
        slug,
        status: 'DRAFT',
        isHomepage: false,
        sections,
        seo: {
          title: `${title} | ViralMuse`,
          description: tpl.description,
          ogImage: '/og-image.jpg',
        },
      });
      setPages((prev) => [newPage, ...prev]);
      onEditPage(newPage.id);
    } catch (err: any) {
      alert(err.message || 'Failed to create page from template blueprint');
    } finally {
      setIsCreatingWithTemplate(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const duplicated = await cmsPagesApi.duplicate(id);
      setPages((prev) => [duplicated, ...prev]);
    } catch (err: any) {
      alert(err.message || 'Duplicate failed');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await cmsPagesApi.delete(id);
      setPages((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      page.title.toLowerCase().includes(search.toLowerCase()) ||
      page.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || page.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Section Template Selection Modal */}
      <CmsSectionTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onInsertSection={handleCreateFromSection}
        onApplyPageTemplate={handleCreateFromPageTemplate}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Website Pages</h2>
          <p className="text-xs sm:text-sm text-white/60 mt-0.5">
            Manage section blocks, hero messaging, and SEO for every public URL.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          {/* Create with Template */}
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            disabled={isCreatingWithTemplate}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#df0567]" />
            <span>Create from Template</span>
          </button>

          {/* Add Blank Page */}
          <button
            onClick={onCreatePage}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-[#df0567]/25 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Blank Page</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#131317] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search pages by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-hidden focus:border-[#df0567]"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-xl border border-white/10 self-stretch sm:self-auto justify-center">
          {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === tab ? 'bg-[#df0567] text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Pages Table */}
      <div className="rounded-2xl bg-[#131317] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[11px] uppercase tracking-wider text-white/50 font-semibold">
                <th className="px-6 py-3.5">Page Title</th>
                <th className="px-6 py-3.5">URL Path</th>
                <th className="px-6 py-3.5">Sections</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Last Updated</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                    Loading pages from database...
                  </td>
                </tr>
              ) : filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                    No pages matching your filter.
                  </td>
                </tr>
              ) : (
                filteredPages.map((page) => (
                  <tr key={page.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
                          {page.isHomepage ? (
                            <Home className="w-4 h-4 text-[#df0567]" />
                          ) : (
                            <FileText className="w-4 h-4 text-white/60" />
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-white group-hover:text-[#df0567] transition-colors block">
                            {page.title}
                          </span>
                          {page.isHomepage && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#df0567] font-semibold uppercase tracking-wider">
                              <Sparkles className="w-2.5 h-2.5" /> Primary Homepage
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-white/60">
                      {page.isHomepage ? '/' : `/p/${page.slug}`}
                    </td>

                    <td className="px-6 py-4 text-white/70">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-[11px] font-medium border border-white/5">
                        {page.sections?.length || 0} Blocks
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {page.status === 'PUBLISHED' ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Published</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">
                          <Clock className="w-3 h-3" />
                          <span>Draft</span>
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs text-white/50">
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* View live public page */}
                        <a
                          href={page.isHomepage ? '/' : `/p/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Preview public page"
                          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {/* Duplicate */}
                        <button
                          onClick={() => handleDuplicate(page.id)}
                          title="Duplicate page"
                          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => onEditPage(page.id)}
                          title="Edit page sections"
                          className="p-1.5 rounded-lg bg-[#df0567]/15 text-[#df0567] hover:bg-[#df0567] hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete (if not homepage) */}
                        {!page.isHomepage && (
                          <button
                            onClick={() => handleDelete(page.id, page.title)}
                            title="Delete page"
                            className="p-1.5 rounded-lg text-red-400/70 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
