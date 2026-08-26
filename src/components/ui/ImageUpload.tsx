'use client';

import * as React from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Check, Loader2 } from 'lucide-react';
import { compressImageFile } from '@/lib/utils/imageCompressor';

export interface ImageUploadProps {
  value?: string | null;
  onChange: (value: string) => void;
  label?: string;
  fallbackText?: string;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'circle' | 'rounded';
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = 'Company / Service Logo',
  fallbackText = 'Logo',
  size = 'md',
  shape = 'circle',
  className = '',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [isUrlMode, setIsUrlMode] = React.useState(false);
  const [urlInput, setUrlInput] = React.useState(value && !value.startsWith('data:') ? value : '');
  const [dragOver, setDragOver] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-base',
    lg: 'w-20 h-20 text-lg',
  }[size];

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size is too large (max 10MB).');
      return;
    }

    setIsUploading(true);
    try {
      // Compress and convert image to lightweight optimized base64 data URL
      const compressedDataUrl = await compressImageFile(file, {
        maxDimension: 320,
        quality: 0.85,
        mimeType: 'image/jpeg',
      });

      onChange(compressedDataUrl);
    } catch (err: any) {
      console.error('Image upload error:', err);
      setErrorMessage(err.message || 'Failed to process image.');
    } finally {
      setIsUploading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setIsUrlMode(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700">
            {label} <span className="font-normal text-slate-400">(Optional)</span>
          </label>
          <button
            type="button"
            onClick={() => setIsUrlMode(!isUrlMode)}
            className="text-[11px] font-semibold text-[#0040e0] hover:underline inline-flex items-center gap-1 min-h-[32px] px-1"
          >
            {isUrlMode ? <Upload className="w-3 h-3" /> : <LinkIcon className="w-3 h-3" />}
            <span>{isUrlMode ? 'Switch to Device Upload' : 'Use Image URL'}</span>
          </button>
        </div>
      )}

      {isUrlMode ? (
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="flex-1 h-9 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#0040e0] focus:ring-2 focus:ring-[#0040e0]/20"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="h-9 px-3 bg-[#0040e0] hover:bg-[#0030b0] text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors shrink-0"
          >
            <Check className="w-3.5 h-3.5" /> Apply
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative p-3 rounded-xl border-2 border-dashed transition-all flex flex-col sm:flex-row items-center gap-3.5 ${
            dragOver
              ? 'border-[#0040e0] bg-blue-50/50'
              : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileInputChange}
            className="hidden"
          />

          {/* Circular / Rounded Avatar Preview */}
          <div className="relative shrink-0">
            {value ? (
              <div
                className={`${sizeClasses} ${
                  shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                } bg-white border-2 border-white shadow-md overflow-hidden flex items-center justify-center p-1 ring-1 ring-slate-200`}
              >
                <img
                  src={value}
                  alt="Logo Preview"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div
                className={`${sizeClasses} ${
                  shape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                } bg-gradient-to-br from-blue-500/10 to-indigo-500/20 text-[#0040e0] font-extrabold flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-200`}
              >
                {fallbackText ? fallbackText.charAt(0).toUpperCase() : <ImageIcon className="w-5 h-5 text-slate-400" />}
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Controls & Actions */}
          <div className="flex-1 text-center sm:text-left space-y-1.5 w-full">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="h-8 px-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 min-h-[36px] sm:min-h-[32px]"
              >
                <Upload className="w-3.5 h-3.5 text-[#0040e0]" />
                <span>{value ? 'Change Image' : 'Upload from Device'}</span>
              </button>

              {value && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="h-8 px-2.5 rounded-lg bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold shadow-xs inline-flex items-center gap-1 transition-colors min-h-[36px] sm:min-h-[32px]"
                >
                  <X className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Drag & drop or tap to browse. Supports PNG, JPG, WebP, SVG (Auto-compressed).
            </p>
          </div>
        </div>
      )}

      {errorMessage && (
        <p className="text-[11px] font-medium text-red-600 animate-fadeIn">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
