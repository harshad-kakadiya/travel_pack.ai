import React from 'react';

export function ImageSkeleton({ className = "w-full h-56" }: { className?: string }) {
  return (
    <div className={`bg-gray-200 animate-pulse rounded ${className}`}>
      <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200 h-full flex flex-col">
      <ImageSkeleton className="w-full h-56" />
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-4/6 animate-pulse"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded mt-4 animate-pulse"></div>
      </div>
    </div>
  );
}