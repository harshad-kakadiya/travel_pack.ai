export function optimizeImageUrl(originalUrl: string, targetWidth: number): string {
  try {
    const url = new URL(originalUrl);
    // Try to hint image CDNs about desired size/quality
    const params = url.searchParams;
    if (!params.has('w')) params.set('w', String(targetWidth));
    if (!params.has('q')) params.set('q', '70');
    if (!params.has('auto')) params.set('auto', 'format');
    // Some unsplash download endpoints use `force=true`; keep it
    url.search = params.toString();
    return url.toString();
  } catch {
    return originalUrl;
  }
}

export function responsiveSizes(): string {
  // Prefer smaller sources on mobile, medium on tablets, large on desktop columns
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 320px';
}
