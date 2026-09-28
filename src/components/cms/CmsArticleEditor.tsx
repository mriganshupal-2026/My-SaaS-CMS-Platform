import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  Globe,
  Image as ImageIcon,
  CheckCircle,
  Eye,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  Link2,
} from 'lucide-react';
import { cmsArticlesApi } from '../../lib/cms-client';
import type { Article } from '../../types/cms';
import CmsMediaPickerModal from './CmsMediaPickerModal';

interface CmsArticleEditorProps {
  articleId?: string;
  onBack: () => void;
  onSaved?: () => void;
}

export default function CmsArticleEditor({
  articleId,
  onBack,
  onSaved,
}: CmsArticleEditorProps) {
  const [article, setArticle] = useState<Partial<Article>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '/og-image.jpg',
    author: 'ViralMuse Editorial',
    category: 'Hospitality Strategy',
    tags: ['Luxury', 'Social Media', 'Cinematography'],
    status: 'DRAFT',
    readingTime: '3 min read',
    seo: {
      title: '',
      description: '',
      ogImage: '/og-image.jpg',
    },
  });

  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'featured' | 'inline' | 'seo'>('featured');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (articleId) {
      loadArticle(articleId);
    }
  }, [articleId]);

  const loadArticle = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await cmsArticlesApi.getById(id);
      setArticle(data);
      setTagInput((data.tags || []).join(', '));
    } catch (err: any) {
      alert(err.message || 'Failed to load article');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (targetStatus?: 'DRAFT' | 'PUBLISHED') => {
    if (!article.title || !article.slug) {
      alert('Article title and slug are required.');
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const tagsArray = tagInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload: Partial<Article> = {
        ...article,
        tags: tagsArray,
        status: targetStatus || article.status || 'DRAFT',
      };

      let saved: Article;
      if (article.id) {
        saved = await cmsArticlesApi.update(article.id, payload);
      } else {
        saved = await cmsArticlesApi.create(payload);
      }

      setArticle(saved);
      setSaveMessage('✓ Article saved and published to live website!');
      setTimeout(() => setSaveMessage(null), 4000);
      onSaved?.();
    } catch (err: any) {
      alert(err.message || 'Failed to save article');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to insert formatting into text area
  const insertFormatting = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = article.content || '';
    const selected = current.substring(start, end);

    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const updated = current.substring(0, start) + replacement + current.substring(end);

    setArticle((prev) => ({ ...prev, content: updated }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 50);
  };

  if (isLoading) {
    return <div className="py-20 text-center text-white/50 text-sm">Loading article...</div>;
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Media Picker Modal */}
      <CmsMediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        acceptType="image"
        onSelect={(url) => {
          if (mediaPickerTarget === 'featured') {
            setArticle((prev) => ({ ...prev, featuredImage: url }));
          } else if (mediaPickerTarget === 'seo') {
            setArticle((prev) => ({
              ...prev,
              seo: { ...prev.seo, ogImage: url },
            }));
          } else if (mediaPickerTarget === 'inline') {
            insertFormatting(`\n<img src="${url}" alt="Editorial visual" class="my-6 rounded-2xl w-full" />\n`);
          }
        }}
      />

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-20 bg-[#0d0d10]/90 backdrop-blur-md py-2 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {article.id ? `Edit: ${article.title || 'Untitled'}` : 'Write New Article'}
            </h2>
            <p className="text-xs text-white/50 font-mono">
              Live URL: /blog/{article.slug || 'slug'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {article.id && (
            <a
              href={`/blog/${article.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-white/60" />
              <span>Preview</span>
            </a>
          )}

          <button
            onClick={() => handleSave('DRAFT')}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            Save Draft
          </button>

          <button
            onClick={() => handleSave('PUBLISHED')}
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-xs font-semibold text-white transition-all shadow-lg shadow-[#df0567]/30 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Publishing...' : 'Publish Article'}</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'content'
              ? 'bg-[#df0567] text-white shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          Article Content &amp; Media
        </button>

        <button
          onClick={() => setActiveTab('seo')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === 'seo'
              ? 'bg-[#df0567] text-white shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Article SEO Metadata</span>
        </button>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Writing Area (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title */}
            <div className="p-5 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                  Article Title *
                </label>
                <input
                  type="text"
                  value={article.title || ''}
                  onChange={(e) => {
                    const title = e.target.value;
                    setArticle((prev) => ({
                      ...prev,
                      title,
                      slug:
                        prev.slug ||
                        title
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)/g, ''),
                    }));
                  }}
                  placeholder="e.g. The 4K Formula: How Luxury Resorts Turn Views Into Direct Bookings"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-base text-white font-bold placeholder:text-white/30 focus:outline-hidden focus:border-[#df0567]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                  Excerpt Summary
                </label>
                <textarea
                  rows={2}
                  value={article.excerpt || ''}
                  onChange={(e) => setArticle((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="A short punchy summary for social cards and article cards..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-hidden focus:border-[#df0567]"
                />
              </div>
            </div>

            {/* Rich Editor Area */}
            <div className="p-5 rounded-2xl bg-[#131317] border border-white/10 space-y-3">
              {/* Formatting Toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-black/40 border border-white/10 text-white/70">
                <button
                  type="button"
                  onClick={() => insertFormatting('<h2>', '</h2>')}
                  title="Heading 2"
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<h3>', '</h3>')}
                  title="Heading 3"
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white"
                >
                  <Heading3 className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button
                  type="button"
                  onClick={() => insertFormatting('<strong>', '</strong>')}
                  title="Bold"
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<em>', '</em>')}
                  title="Italic"
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<blockquote>"', '"</blockquote>')}
                  title="Quote"
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('<ul>\n  <li>', '</li>\n</ul>')}
                  title="List"
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white"
                >
                  <List className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button
                  type="button"
                  onClick={() => {
                    setMediaPickerTarget('inline');
                    setMediaPickerOpen(true);
                  }}
                  title="Insert Media Image"
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white flex items-center gap-1 text-xs"
                >
                  <ImageIcon className="w-4 h-4 text-[#df0567]" />
                  <span>Insert Image</span>
                </button>
              </div>

              {/* Text Area */}
              <div>
                <textarea
                  ref={textareaRef}
                  rows={14}
                  value={article.content || ''}
                  onChange={(e) => setArticle((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your article in HTML or markdown formatted paragraphs..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/30 font-mono focus:outline-hidden focus:border-[#df0567] leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Sidebar Settings (1 col) */}
          <div className="space-y-5">
            {/* Featured Image */}
            <div className="p-5 rounded-2xl bg-[#131317] border border-white/10 space-y-3">
              <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider">
                Featured Cover Image
              </label>

              <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/40">
                <img
                  src={article.featuredImage || '/og-image.jpg'}
                  alt="Featured cover"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={article.featuredImage || ''}
                  onChange={(e) => setArticle((prev) => ({ ...prev, featuredImage: e.target.value }))}
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMediaPickerTarget('featured');
                    setMediaPickerOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#df0567] hover:bg-[#c4045a] text-white text-xs font-medium cursor-pointer"
                >
                  Select
                </button>
              </div>
            </div>

            {/* Publishing Metadata */}
            <div className="p-5 rounded-2xl bg-[#131317] border border-white/10 space-y-4 text-xs">
              <div>
                <label className="block text-white/70 font-medium mb-1">URL Slug *</label>
                <input
                  type="text"
                  value={article.slug || ''}
                  onChange={(e) =>
                    setArticle((prev) => ({
                      ...prev,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'),
                    }))
                  }
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-white/70 font-medium mb-1">Author</label>
                <input
                  type="text"
                  value={article.author || ''}
                  onChange={(e) => setArticle((prev) => ({ ...prev, author: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-white/70 font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={article.category || ''}
                  onChange={(e) => setArticle((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g. Hospitality Strategy"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-white/70 font-medium mb-1">Tags (Comma Separated)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Luxury, TikTok, ROI, Hospitality"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-white/70 font-medium mb-1">Reading Time Estimate</label>
                <input
                  type="text"
                  value={article.readingTime || ''}
                  onChange={(e) => setArticle((prev) => ({ ...prev, readingTime: e.target.value }))}
                  placeholder="e.g. 4 min read"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-white/70 font-medium mb-1">Status</label>
                <select
                  value={article.status || 'DRAFT'}
                  onChange={(e) => setArticle((prev) => ({ ...prev, status: e.target.value as any }))}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <div className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
              Article Meta Title
            </label>
            <input
              type="text"
              value={article.seo?.title || ''}
              onChange={(e) =>
                setArticle((prev) => ({
                  ...prev,
                  seo: { ...prev.seo, title: e.target.value },
                }))
              }
              placeholder="e.g. The 4K Formula for Luxury Resorts | ViralMuse"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-hidden focus:border-[#df0567]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
              Meta Description
            </label>
            <textarea
              rows={3}
              value={article.seo?.description || ''}
              onChange={(e) =>
                setArticle((prev) => ({
                  ...prev,
                  seo: { ...prev.seo, description: e.target.value },
                }))
              }
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-hidden focus:border-[#df0567]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
