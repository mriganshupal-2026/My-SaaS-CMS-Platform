import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, Share2, Tag, Check, Sparkles } from 'lucide-react';
import { publicApi } from '../../lib/cms-client';
import { updatePageSeo } from '../../lib/seo';
import Footer from '../layout/Footer';
import type { Article } from '../../types/cms';
import type { LanguageCode } from '../../types';

interface ArticleDetailProps {
  slug: string;
  onBackToBlog: () => void;
  onOpenInquiry: () => void;
}

export default function ArticleDetail({
  slug,
  onBackToBlog,
  onOpenInquiry,
}: ArticleDetailProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [currentLang, setCurrentLang] = useState<LanguageCode>('EN');

  useEffect(() => {
    loadArticle();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const loadArticle = async () => {
    setIsLoading(true);
    try {
      const data = await publicApi.getArticleBySlug(slug);
      setArticle(data);
      if (data) {
        updatePageSeo({
          title: data.seo?.title || data.title,
          description: data.seo?.description || data.excerpt,
          canonicalUrl: `/blog/${data.slug}`,
          ogImage: data.seo?.ogImage || data.featuredImage,
        });
      }
    } catch (err) {
      console.error('Failed to load article:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: article?.title,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070709] text-white flex items-center justify-center font-mono text-sm">
        Loading article...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
        <button
          onClick={onBackToBlog}
          className="px-6 py-2.5 rounded-full bg-[#df0567] text-white text-xs uppercase font-bold tracking-wider"
        >
          Return to Blog
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] text-white selection:bg-[#df0567] selection:text-white font-sans antialiased">
      {/* Top Breadcrumb & Share Header */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-[#070709]/80 backdrop-blur-md border-b border-white/10 px-6 sm:px-12 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBackToBlog}
            className="flex items-center space-x-2 text-xs uppercase font-bold tracking-wider text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#df0567]" />
            <span>All Articles</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Article</span>
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="pt-32 pb-12 px-6 sm:px-12 max-w-4xl mx-auto space-y-6 text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#df0567]/15 border border-[#df0567]/30 text-[#df0567] text-xs font-semibold uppercase tracking-wider font-mono">
          <Tag className="w-3 h-3" />
          <span>{article.category}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight max-w-3xl mx-auto">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/50 pt-2">
          <span>By {article.author}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {article.readingTime || '4 min read'}
          </span>
        </div>
      </header>

      {/* Featured Cover Image */}
      {article.featuredImage && (
        <div className="max-w-5xl mx-auto px-6 sm:px-12 mb-16">
          <div className="aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/60">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Article Body Content */}
      <main className="max-w-3xl mx-auto px-6 sm:px-8 pb-20">
        <div
          className="prose prose-invert prose-pink max-w-none text-white/85 text-base sm:text-lg leading-relaxed font-sans space-y-6 [&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_blockquote]:border-l-4 [&_blockquote]:border-[#df0567] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-white/90 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-2 [&_p]:mb-4"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-2">
            {article.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 font-mono"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Agency CTA Card */}
        <div className="mt-16 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#1b1520] via-[#14141a] to-[#121216] border border-[#df0567]/30 shadow-2xl relative overflow-hidden text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#df0567]/20 text-[#df0567] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for 4K Transformation?</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Elevate Your Luxury Property's Digital Footprint
          </h3>

          <p className="text-sm text-white/70 max-w-lg mx-auto">
            Speak with our creative directors to audit your short-form distribution and booking conversion strategy.
          </p>

          <div className="pt-2">
            <button
              onClick={onOpenInquiry}
              className="px-8 py-3.5 rounded-full bg-[#df0567] hover:bg-[#c4045a] text-white text-xs uppercase font-bold tracking-widest transition-all shadow-lg shadow-[#df0567]/30 cursor-pointer"
            >
              Start Consultation
            </button>
          </div>
        </div>
      </main>

      {/* Global Luxury Footer */}
      <Footer currentLang={currentLang} onSelectLang={setCurrentLang} />
    </div>
  );
}
