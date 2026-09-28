import { useState, useEffect } from 'react';
import {
  PlusCircle,
  Search,
  BookOpen,
  Trash2,
  Edit,
  ExternalLink,
  CheckCircle2,
  Clock,
  Tag,
} from 'lucide-react';
import { cmsArticlesApi } from '../../lib/cms-client';
import type { Article } from '../../types/cms';

interface CmsArticlesListProps {
  onEditArticle: (articleId: string) => void;
  onCreateArticle: () => void;
}

export default function CmsArticlesList({
  onEditArticle,
  onCreateArticle,
}: CmsArticlesListProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const items = await cmsArticlesApi.getAll();
      setArticles(items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete article "${title}"?`)) return;
    try {
      await cmsArticlesApi.delete(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.slug.toLowerCase().includes(search.toLowerCase()) ||
      article.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || article.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Editorial &amp; Blog</h2>
          <p className="text-xs sm:text-sm text-white/60 mt-0.5">
            Publish thought leadership, hospitality case studies, and short-form growth insights on <span className="font-mono text-[#df0567]">/blog</span>.
          </p>
        </div>

        <button
          onClick={onCreateArticle}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-[#df0567]/25 cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Write Article</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#131317] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search articles by title, slug, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-hidden focus:border-[#df0567]"
          />
        </div>

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

      {/* Articles Table */}
      <div className="rounded-2xl bg-[#131317] border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[11px] uppercase tracking-wider text-white/50 font-semibold">
                <th className="px-6 py-3.5">Article</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Author</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Publish Date</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                    Loading articles...
                  </td>
                </tr>
              ) : filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                    No articles found. Create your first article above.
                  </td>
                </tr>
              ) : (
                filteredArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3.5">
                        <img
                          src={art.featuredImage || '/og-image.jpg'}
                          alt={art.title}
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                        />
                        <div className="max-w-md">
                          <span className="font-semibold text-white group-hover:text-[#df0567] transition-colors block line-clamp-1">
                            {art.title}
                          </span>
                          <span className="text-[11px] text-white/50 font-mono">
                            /blog/{art.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-white/80 font-medium">
                        <Tag className="w-3 h-3 text-[#df0567]" />
                        <span>{art.category}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4 text-white/70">{art.author}</td>

                    <td className="px-6 py-4">
                      {art.status === 'PUBLISHED' ? (
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
                      {new Date(art.publishedAt || art.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* View Public Article */}
                        <a
                          href={`/blog/${art.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View live article"
                          className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        {/* Edit */}
                        <button
                          onClick={() => onEditArticle(art.id)}
                          title="Edit article"
                          className="p-1.5 rounded-lg bg-[#df0567]/15 text-[#df0567] hover:bg-[#df0567] hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(art.id, art.title)}
                          title="Delete article"
                          className="p-1.5 rounded-lg text-red-400/70 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
