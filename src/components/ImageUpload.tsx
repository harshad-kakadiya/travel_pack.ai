import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import { supabasePublic, uploadImageToBlogBucket } from '../lib/supabasePublic';

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  currentImageUrl?: string;
  className?: string;
}

export function ImageUpload({ onImageSelect, currentImageUrl, className = '' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Upload using public client
      const uploadResult = await uploadImageToBlogBucket(file, file.name);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      onImageSelect(uploadResult.url!);
      setError(null);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageSelect('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    if (url) {
      setPreviewUrl(url);
      onImageSelect(url);
    } else {
      setPreviewUrl(null);
      onImageSelect('');
    }
  };


  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Blog Image
      </label>
      
      {/* Image Preview */}
      {previewUrl && (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-2">
          {error}
        </div>
      )}

      {/* Upload Options */}
      <div className="space-y-3">
        {/* File Upload */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Choose Image File'}
          </button>
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Or enter image URL:</label>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            onChange={handleUrlInput}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Image Filters Preview */}
      <div className="space-y-2">
        <label className="block text-xs text-gray-500">Image Filters:</label>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            onClick={() => {
              // Apply grayscale filter
              if (previewUrl) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  ctx?.drawImage(img, 0, 0);
                  const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
                  if (imageData) {
                    const data = imageData.data;
                    for (let i = 0; i < data.length; i += 4) {
                      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
                      data[i] = gray;
                      data[i + 1] = gray;
                      data[i + 2] = gray;
                    }
                    ctx?.putImageData(imageData, 0, 0);
                    const filteredUrl = canvas.toDataURL();
                    setPreviewUrl(filteredUrl);
                    onImageSelect(filteredUrl);
                  }
                };
                img.src = previewUrl;
              }
            }}
          >
            Grayscale
          </button>
          <button
            type="button"
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            onClick={() => {
              // Apply sepia filter
              if (previewUrl) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  ctx?.drawImage(img, 0, 0);
                  const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
                  if (imageData) {
                    const data = imageData.data;
                    for (let i = 0; i < data.length; i += 4) {
                      const r = data[i];
                      const g = data[i + 1];
                      const b = data[i + 2];
                      data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                      data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                      data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
                    }
                    ctx?.putImageData(imageData, 0, 0);
                    const filteredUrl = canvas.toDataURL();
                    setPreviewUrl(filteredUrl);
                    onImageSelect(filteredUrl);
                  }
                };
                img.src = previewUrl;
              }
            }}
          >
            Sepia
          </button>
          <button
            type="button"
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            onClick={() => {
              // Apply brightness filter
              if (previewUrl) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  ctx?.drawImage(img, 0, 0);
                  const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
                  if (imageData) {
                    const data = imageData.data;
                    for (let i = 0; i < data.length; i += 4) {
                      data[i] = Math.min(255, data[i] * 1.2);
                      data[i + 1] = Math.min(255, data[i + 1] * 1.2);
                      data[i + 2] = Math.min(255, data[i + 2] * 1.2);
                    }
                    ctx?.putImageData(imageData, 0, 0);
                    const filteredUrl = canvas.toDataURL();
                    setPreviewUrl(filteredUrl);
                    onImageSelect(filteredUrl);
                  }
                };
                img.src = previewUrl;
              }
            }}
          >
            Brighten
          </button>
          <button
            type="button"
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
            onClick={() => {
              // Reset to original
              if (currentImageUrl) {
                setPreviewUrl(currentImageUrl);
                onImageSelect(currentImageUrl);
              }
            }}
          >
            Original
          </button>
        </div>
      </div>
    </div>
  );
}