import { useState, useEffect } from 'react';
import { ArrowUpRight, Clock, Tag, ArrowLeft } from 'lucide-react';
import { publicApi } from '../../lib/cms-client';
import Footer from '../layout/Footer';
import type { Article } from '../../types/cms';
import type { LanguageCode } from '../../types';

interface BlogListProps {
  onSelectArticle: (slug: string) => void;
  onGoHome: () => void;
}

export default function BlogList({ onSelectArticle, onGoHome }: BlogListProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState<LanguageCode>('EN');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const data = await publicApi.getArticles();
      setArticles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['ALL', ...Array.from(new Set(articles.map((a) => a.category).filter(Boolean)))];

  const filtered = articles.filter((a) =>
    selectedCategory === 'ALL' ? true : a.category === selectedCategory
  );

  const featuredArticle = filtered[0];
  const restArticles = filtered.slice(1);

  return (
    <div className="min-h-screen bg-[#070709] text-white selection:bg-[#df0567] selection:text-white font-sans antialiased">
      {/* Editorial Header */}
      <header className="relative pt-32 pb-16 px-6 sm:px-12 max-w-7xl mx-auto border-b border-white/10">
        <button
          onClick={onGoHome}
          className="group inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-white/60 hover:text-white mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#df0567] group-hover:-translate-x-1 transition-transform" />
          <span>Back to Main Website</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[#df0567] text-xs uppercase font-bold tracking-widest block mb-2 font-mono">
              VIRALMUSE JOURNAL &amp; INSIGHTS
            </span>
            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter leading-none text-white">
              The Architecture <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40">
                Of Modern Desire.
              </span>
            </h1>
          </div>

          <p className="text-sm sm:text-base text-white/60 max-w-md leading-relaxed">
            Case studies, short-form algorithms, luxury consumer psychology, and cinematic production teardowns for high-end hospitality.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mt-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#df0567] text-white shadow-[0_0_20px_rgba(223,5,103,0.4)]'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Main Articles Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-12 py-16">
        {isLoading ? (
          <div className="py-24 text-center text-white/40 font-mono text-sm">
            Fetching editorial intelligence...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center text-white/40 text-sm">
            No articles found in this category.
          </div>
        ) : (
          <div className="space-y-16">
            {/* Featured Hero Article */}
            {featuredArticle && (
              <div
                onClick={() => onSelectArticle(featuredArticle.slug)}
                className="group relative rounded-3xl overflow-hidden border border-white/10 bg-[#121216] cursor-pointer grid grid-cols-1 lg:grid-cols-2 hover:border-[#df0567]/50 transition-all duration-500 shadow-2xl"
              >
                <div className="relative aspect-video lg:aspect-auto overflow-hidden bg-black/60">
                  <img
                    src={featuredArticle.featuredImage || '/og-image.jpg'}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white text-[10px] uppercase font-bold tracking-wider">
                      Featured Cover Story
                    </span>
                  </div>
                </div>

                <div className="p-8 sm:p-12 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-xs text-white/50">
                      <span className="text-[#df0567] font-semibold">{featuredArticle.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {featuredArticle.readingTime || '4 min read'}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-[#df0567] transition-colors leading-tight">
                      {featuredArticle.title}
                    </h2>

                    <p className="text-sm text-white/70 leading-relaxed line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-white/10 flex items-center justify-between mt-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#df0567] to-purple-600 flex items-center justify-center font-bold text-xs text-white">
                        {featuredArticle.author.charAt(0)}
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-white">
                          {featuredArticle.author}
                        </span>
                        <span className="text-[10px] text-white/40">
                          {new Date(
                            featuredArticle.publishedAt || featuredArticle.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 text-xs font-semibold text-[#df0567] group-hover:translate-x-1 transition-transform">
                      <span>Read Story</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Grid */}
            {restArticles.length > 0 && (
              <div>
                <h3 className="text-xs uppercase tracking-widest font-bold text-white/40 mb-8 font-mono">
                  More From ViralMuse Editorial
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {restArticles.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => onSelectArticle(art.slug)}
                      className="group flex flex-col justify-between rounded-2xl overflow-hidden border border-white/10 bg-[#121216] hover:border-[#df0567]/50 transition-all duration-300 cursor-pointer shadow-lg"
                    >
                      <div>
                        <div className="relative aspect-video overflow-hidden bg-black/40">
                          <img
                            src={art.featuredImage || '/og-image.jpg'}
                            alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        <div className="p-6 space-y-3">
                          <div className="flex items-center justify-between text-[11px] text-white/50">
                            <span className="text-[#df0567] font-semibold">{art.category}</span>
                            <span>{art.readingTime || '3 min'}</span>
                          </div>

                          <h4 className="text-lg font-bold text-white group-hover:text-[#df0567] transition-colors line-clamp-2 leading-snug">
                            {art.title}
                          </h4>

                          <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                            {art.excerpt}
                          </p>
                        </div>
                      </div>

                      <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                        <span>{new Date(art.publishedAt || art.createdAt).toLocaleDateString()}</span>
                        <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-[#df0567] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Luxury Footer */}
      <Footer currentLang={currentLang} onSelectLang={setCurrentLang} />
    </div>
  );
}
