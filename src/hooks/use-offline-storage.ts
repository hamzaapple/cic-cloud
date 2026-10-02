import { useState, useEffect, useCallback } from 'react';

const CACHE_NAME = 'cic-offline-materials-v1';

export interface CachedItem {
  url: string;
  size: number;
}

export function useOfflineStorage() {
  const [cachedItems, setCachedItems] = useState<CachedItem[]>([]);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [isSupported] = useState('caches' in window);

  const refreshCacheInfo = useCallback(async () => {
    if (!isSupported) return;
    try {
      const cache = await caches.open(CACHE_NAME);
      const requests = await cache.keys();
      
      let totalBytes = 0;
      const items: CachedItem[] = [];

      for (const req of requests) {
        const res = await cache.match(req);
        if (res) {
          const blob = await res.blob();
          items.push({ url: req.url, size: blob.size });
          totalBytes += blob.size;
        }
      }

      setCachedItems(items);
      setTotalSize(totalBytes);
    } catch (err) {
      console.error('Failed to read cache:', err);
    }
  }, [isSupported]);

  useEffect(() => {
    refreshCacheInfo();
  }, [refreshCacheInfo]);

  const saveToOffline = useCallback(async (url: string, onProgress?: (pct: number) => void, signal?: AbortSignal) => {
    if (!isSupported) return false;
    try {
      const response = await fetch(url, { mode: 'cors', signal });
      if (!response.ok) throw new Error('Fetch failed');
      
      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      let loaded = 0;
      const res = new Response(
        new ReadableStream({
          async start(controller) {
            const reader = response.body?.getReader();
            if (!reader) {
              controller.close();
              return;
            }
            while (true) {
              if (signal?.aborted) {
                controller.error(new Error('Aborted'));
                break;
              }
              const { done, value } = await reader.read();
              if (done) break;
              loaded += value.length;
              if (total && onProgress) {
                onProgress(Math.round((loaded / total) * 100));
              }
              controller.enqueue(value);
            }
            controller.close();
          },
        }),
        {
          headers: response.headers,
          status: response.status,
          statusText: response.statusText,
        }
      );

      const cache = await caches.open(CACHE_NAME);
      await cache.put(url, res);
      await refreshCacheInfo();
      return true;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Download aborted');
        return false;
      }
      console.error('Failed to cache:', err);
      return false;
    }
  }, [isSupported, refreshCacheInfo]);

  const removeFromOffline = useCallback(async (url: string) => {
    if (!isSupported) return false;
    try {
      const cache = await caches.open(CACHE_NAME);
      const deleted = await cache.delete(url);
      if (deleted) {
        await refreshCacheInfo();
      }
      return deleted;
    } catch (err) {
      console.error('Failed to delete from cache:', err);
      return false;
    }
  }, [isSupported, refreshCacheInfo]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isCached = useCallback((url: string) => {
    return cachedItems.some(item => item.url === url);
  }, [cachedItems]);

  const getCachedUrl = useCallback(async (url: string) => {
    if (!isSupported) return null;
    try {
      const cache = await caches.open(CACHE_NAME);
      const match = await cache.match(url);
      if (match) {
        const blob = await match.blob();
        if (blob.size < 1024) {
          console.warn("Cached file is suspiciously small or corrupted, removing from cache:", url);
          await cache.delete(url);
          refreshCacheInfo();
          return null;
        }
        return URL.createObjectURL(blob);
      }
    } catch (err) {
      console.error('Failed to get cached url:', err);
    }
    return null;
  }, [isSupported]);

  const saveMultipleToOffline = useCallback(async (urls: string[], onProgress?: (completed: number, total: number, currentFilePct: number) => void, signal?: AbortSignal) => {
    if (!isSupported) return false;
    let successCount = 0;
    const total = urls.length;
    for (let i = 0; i < total; i++) {
      if (signal?.aborted) return false;
      const url = urls[i];
      if (!isCached(url)) {
        await saveToOffline(url, (pct) => {
          if (onProgress) onProgress(successCount, total, pct);
        }, signal);
      }
      if (signal?.aborted) return false;
      successCount++;
      if (onProgress) {
        onProgress(successCount, total, 100);
      }
    }
    return successCount === total;
  }, [isSupported, isCached, saveToOffline]);

  const clearAllOffline = useCallback(async () => {
    if (!isSupported) return false;
    try {
      const cache = await caches.open(CACHE_NAME);
      const keys = await cache.keys();
      await Promise.all(keys.map(k => cache.delete(k)));
      await refreshCacheInfo();
      return true;
    } catch (err) {
      console.error('Failed to clear cache:', err);
      return false;
    }
  }, [isSupported, refreshCacheInfo]);

  return {
    cachedItems,
    totalSize,
    formatSize,
    saveToOffline,
    saveMultipleToOffline,
    removeFromOffline,
    clearAllOffline,
    refreshCacheInfo,
    isCached,
    getCachedUrl,
    isSupported
  };
}
