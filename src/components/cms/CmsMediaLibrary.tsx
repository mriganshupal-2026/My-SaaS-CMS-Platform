import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Search,
  Trash2,
  Copy,
  Check,
  Image as ImageIcon,
  ExternalLink,
  Edit2,
  Save,
  X,
} from 'lucide-react';
import { cmsMediaApi } from '../../lib/cms-client';
import type { MediaItem } from '../../types/cms';

export default function CmsMediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IMAGE' | 'VIDEO'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Detail & edit modal
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [editAlt, setEditAlt] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [isSavingMeta, setIsSavingMeta] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const items = await cmsMediaApi.getAll();
      setMedia(items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const item = await cmsMediaApi.upload(files[i]);
        setMedia((prev) => [item, ...prev]);
      }
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete media asset "${name}"?`)) return;
    try {
      await cmsMediaApi.delete(id);
      setMedia((prev) => prev.filter((m) => m.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const openMetaModal = (item: MediaItem) => {
    setSelectedItem(item);
    setEditAlt(item.altText || '');
    setEditCaption(item.caption || '');
  };

  const saveMetadata = async () => {
    if (!selectedItem) return;
    setIsSavingMeta(true);
    try {
      const updated = await cmsMediaApi.update(selectedItem.id, {
        altText: editAlt,
        caption: editCaption,
      });
      setMedia((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setSelectedItem(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update metadata');
    } finally {
      setIsSavingMeta(false);
    }
  };

  const filteredMedia = media.filter((item) => {
    const matchesSearch =
      item.originalName.toLowerCase().includes(search.toLowerCase()) ||
      (item.altText && item.altText.toLowerCase().includes(search.toLowerCase()));

    if (typeFilter === 'IMAGE') return matchesSearch && item.mimeType.startsWith('image/');
    if (typeFilter === 'VIDEO') return matchesSearch && item.mimeType.startsWith('video/');
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Media Library</h2>
          <p className="text-xs sm:text-sm text-white/60 mt-0.5">
            Store 4K cinematic production assets, photography, and OpenGraph social graphics.
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-white text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-[#df0567]/25 cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Uploading Media...' : 'Upload Asset'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#131317] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search media by filename or alt text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-hidden focus:border-[#df0567]"
          />
        </div>

        <div className="flex items-center space-x-1 bg-black/40 p-1 rounded-xl border border-white/10 self-stretch sm:self-auto justify-center">
          {(['ALL', 'IMAGE', 'VIDEO'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setTypeFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                typeFilter === tab ? 'bg-[#df0567] text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-white/40 text-sm">
            Loading media items...
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="col-span-full py-16 text-center text-white/40 text-sm">
            No media found in library.
          </div>
        ) : (
          filteredMedia.map((item) => {
            const isVideo = item.mimeType.startsWith('video/');
            const isCopied = copiedUrl === item.url;

            return (
              <div
                key={item.id}
                className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-[#131317] hover:border-white/30 transition-all shadow-md flex flex-col justify-between"
              >
                {/* Media Preview */}
                {isVideo ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-black/60 p-3 text-center">
                    <span className="text-xs uppercase font-mono text-[#df0567] mb-1 font-bold">
                      VIDEO
                    </span>
                    <span className="text-xs text-white/80 line-clamp-2">{item.originalName}</span>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.altText || item.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}

                {/* Top Floating Action Buttons */}
                <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyToClipboard(item.url)}
                    title="Copy URL"
                    className="p-1.5 rounded-lg bg-black/70 backdrop-blur-xs text-white/80 hover:text-white hover:bg-black cursor-pointer shadow-md"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => openMetaModal(item)}
                    title="Edit Metadata (Alt/Caption)"
                    className="p-1.5 rounded-lg bg-black/70 backdrop-blur-xs text-white/80 hover:text-white hover:bg-black cursor-pointer shadow-md"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.originalName)}
                    title="Delete Media"
                    className="p-1.5 rounded-lg bg-red-500/80 backdrop-blur-xs text-white hover:bg-red-600 cursor-pointer shadow-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2.5">
                  <p className="text-xs text-white truncate font-medium">{item.originalName}</p>
                  <div className="flex items-center justify-between text-[10px] text-white/50 mt-0.5 font-mono">
                    <span>{(item.size / 1024).toFixed(0)} KB</span>
                    <span className="uppercase">{item.mimeType.split('/')[1]}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Metadata Edit Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[#121216] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base">Edit Media Metadata</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-white/70 font-medium mb-1">Filename</label>
                <input
                  type="text"
                  disabled
                  value={selectedItem.originalName}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white/50 font-mono"
                />
              </div>

              <div>
                <label className="block text-white/70 font-medium mb-1">Image Alt Text (SEO)</label>
                <input
                  type="text"
                  value={editAlt}
                  onChange={(e) => setEditAlt(e.target.value)}
                  placeholder="Descriptive alt text for screen readers & SEO..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:outline-hidden focus:border-[#df0567]"
                />
              </div>

              <div>
                <label className="block text-white/70 font-medium mb-1">Caption</label>
                <input
                  type="text"
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder="Optional caption..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:outline-hidden focus:border-[#df0567]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-lg text-xs text-white/70 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={saveMetadata}
                disabled={isSavingMeta}
                className="px-5 py-2 rounded-lg bg-[#df0567] hover:bg-[#c4045a] text-white text-xs font-semibold"
              >
                {isSavingMeta ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
