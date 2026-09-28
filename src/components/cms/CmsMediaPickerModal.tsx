import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Search, Image as ImageIcon, Check } from 'lucide-react';
import { cmsMediaApi } from '../../lib/cms-client';
import type { MediaItem } from '../../types/cms';

interface CmsMediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mediaUrl: string, altText?: string) => void;
  title?: string;
  acceptType?: 'all' | 'image' | 'video';
}

export default function CmsMediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Select Media Asset',
  acceptType = 'all',
}: CmsMediaPickerModalProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const items = await cmsMediaApi.getAll();
      setMediaList(items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const newItem = await cmsMediaApi.upload(file);
      setMediaList((prev) => [newItem, ...prev]);
      setSelectedUrl(newItem.url);
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  const filteredMedia = mediaList.filter((item) => {
    const matchesSearch =
      item.originalName.toLowerCase().includes(search.toLowerCase()) ||
      (item.altText && item.altText.toLowerCase().includes(search.toLowerCase()));

    if (acceptType === 'image') {
      return matchesSearch && item.mimeType.startsWith('image/');
    }
    if (acceptType === 'video') {
      return matchesSearch && item.mimeType.startsWith('video/');
    }
    return matchesSearch;
  });

  const selectedItem = mediaList.find((m) => m.url === selectedUrl);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-[#121214] border border-white/10 rounded-2xl flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <ImageIcon className="w-5 h-5 text-[#df0567]" />
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3 bg-white/5 border-b border-white/5">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search media..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder:text-white/40 focus:outline-hidden focus:border-[#df0567]"
            />
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept={acceptType === 'image' ? 'image/*' : acceptType === 'video' ? 'video/*' : 'image/*,video/*'}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-[#df0567] hover:bg-[#c4045a] text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? 'Uploading...' : 'Upload New'}</span>
            </button>
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-white/40 text-sm">
              Loading media library...
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="col-span-full py-12 text-center text-white/40 text-sm">
              No media found. Upload an image or video to get started.
            </div>
          ) : (
            filteredMedia.map((item) => {
              const isSelected = selectedUrl === item.url;
              const isVideo = item.mimeType.startsWith('video/');

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedUrl(item.url)}
                  className={`group relative aspect-square rounded-xl overflow-hidden border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#df0567] ring-2 ring-[#df0567]/50'
                      : 'border-white/10 hover:border-white/30 bg-black/40'
                  }`}
                >
                  {isVideo ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-black/60 p-2 text-center">
                      <span className="text-xs uppercase font-mono text-[#df0567] mb-1">VIDEO</span>
                      <span className="text-[11px] text-white/80 line-clamp-2">{item.originalName}</span>
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt={item.altText || item.originalName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#df0567] text-white flex items-center justify-center shadow-md">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[11px] text-white truncate font-medium">{item.originalName}</p>
                    <p className="text-[10px] text-white/60">{(item.size / 1024).toFixed(0)} KB</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5">
          <div className="text-xs text-white/60 truncate max-w-sm">
            {selectedItem ? `Selected: ${selectedItem.originalName}` : 'Select an asset from the gallery'}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (selectedUrl) {
                  onSelect(selectedUrl, selectedItem?.altText);
                  onClose();
                }
              }}
              disabled={!selectedUrl}
              className="px-5 py-2 rounded-lg bg-[#df0567] hover:bg-[#c4045a] text-white text-sm font-semibold transition-colors disabled:opacity-40 cursor-pointer"
            >
              Insert Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
