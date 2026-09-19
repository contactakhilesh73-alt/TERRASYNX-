import React, { useState, useEffect } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  ShieldCheck, 
  Sparkles,
  Radio,
  Globe2,
  Upload,
  Link as LinkIcon,
  Check,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

interface InsigniaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InsigniaModal: React.FC<InsigniaModalProps> = ({ isOpen, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeImage, setActiveImage] = useState<string>(() => {
    return localStorage.getItem('terrasynx_custom_logo_url') || '/assets/terrasynx-original.png';
  });
  const [inputUrl, setInputUrl] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [isApplied, setIsApplied] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('terrasynx_custom_logo_url');
    if (saved) {
      setActiveImage(saved);
      setInputUrl(saved.startsWith('data:') ? '' : saved);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 50, 400));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 50, 50));
  const handleResetZoom = () => setZoomLevel(100);

  // Direct File Upload from user's device (100% exact, no change, no compression)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        localStorage.setItem('terrasynx_custom_logo_url', dataUrl);
        setActiveImage(dataUrl);
        window.dispatchEvent(new Event('terrasynx_logo_updated'));
        setIsApplied(true);
        setTimeout(() => setIsApplied(false), 2500);
      }
    };
    reader.readAsDataURL(file);
  };

  // Direct Link Paste (e.g. Imgur, PostImages, Google Drive, Cloudinary)
  const handleApplyUrl = () => {
    if (!inputUrl.trim()) return;
    const url = inputUrl.trim();
    localStorage.setItem('terrasynx_custom_logo_url', url);
    setActiveImage(url);
    window.dispatchEvent(new Event('terrasynx_logo_updated'));
    setIsApplied(true);
    setTimeout(() => setIsApplied(false), 2500);
  };

  // Reset to default
  const handleResetToDefault = () => {
    localStorage.removeItem('terrasynx_custom_logo_url');
    setActiveImage('/assets/terrasynx-original.png');
    setInputUrl('');
    window.dispatchEvent(new Event('terrasynx_logo_updated'));
  };

  const handleDownloadSvg = () => {
    const link = document.createElement('a');
    link.href = activeImage;
    link.download = 'TERRASYNX-Original-Asset';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl max-h-[96vh] flex flex-col rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-2xl shadow-cyan-950/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center overflow-hidden">
              <img 
                src={activeImage} 
                alt="TerraSynx Emblem" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/terrasynx-original.png';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-wider text-slate-100 font-mono">
                  TERRASYNX MASTER BRAND ASSET
                </h2>
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  ORIGINAL HD SOURCE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                100% exact original pixel-perfect graphic (Zero modification, untouched)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1 text-xs font-mono">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
                className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Zoom Out (-50%)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-bold text-cyan-300 min-w-[50px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 400}
                className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Zoom In (+50%)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                title="Reset Zoom to 100%"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleDownloadSvg}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/50 text-xs font-mono font-semibold transition-all cursor-pointer"
              title="Download asset"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Bar: Direct File Upload & Direct Link Insertion */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold cursor-pointer shadow-md shadow-cyan-950 transition-all">
              <Upload className="w-4 h-4" />
              <span>Select Original Image From Device</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                className="hidden" 
              />
            </label>

            <button
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Paste Direct Image URL</span>
            </button>

            {localStorage.getItem('terrasynx_custom_logo_url') && (
              <button
                onClick={handleResetToDefault}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/40 text-[11px] transition-all cursor-pointer"
                title="Reset to default graphic"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {isApplied && (
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono font-semibold animate-pulse">
              <Check className="w-4 h-4" />
              Original image applied across App Header &amp; Branding!
            </span>
          )}
        </div>

        {/* Expandable Image URL Input Box */}
        {showUrlInput && (
          <div className="px-5 py-3 bg-slate-950 border-b border-cyan-900/40 flex items-center gap-3">
            <input 
              type="text"
              placeholder="Paste direct image link (e.g. https://.../terrasynx.png)"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/40 text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleApplyUrl}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition-all cursor-pointer shadow"
            >
              Apply Link
            </button>
          </div>
        )}

        {/* Modal Body: Direct High-Fidelity Canvas */}
        <div className="relative flex-1 overflow-auto bg-[#01040a] p-4 sm:p-8 flex items-center justify-center min-h-[400px] max-h-[66vh] select-none cursor-grab active:cursor-grabbing">
          <div 
            className="transition-transform duration-200 origin-center flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <img 
              src={activeImage} 
              alt="TerraSynx Global Intelligence System - Master Original Asset" 
              className="w-[700px] max-w-none h-auto drop-shadow-[0_0_35px_rgba(6,182,212,0.35)] rounded-2xl"
              style={{ imageRendering: 'auto' }}
              referrerPolicy="no-referrer"
              onError={(e) => {
                // If /logo.png or custom link fails, fallback gracefully
                (e.target as HTMLImageElement).src = '/assets/terrasynx-brand.svg';
              }}
            />
          </div>
        </div>

        {/* Modal Footer: Guidance */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Direct 1:1 Rendering: No AI modification applied</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full RGB Gamma &amp; High-Bitrate Clarity Preserved</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel(200)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              200% Zoom
            </button>
            <button
              onClick={() => setZoomLevel(400)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
            >
              400% Extreme Zoom
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
