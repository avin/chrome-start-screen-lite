const FAVICON_CACHE_PREFIX = 'favicon:';
const FAVICON_CACHE_VERSION = 1;
const FAVICON_SIZE = 32;

interface CachedFavicon {
  version: number;
  dataUrl: string;
  timestamp: number;
}

async function fetchFaviconFromSite(url: string): Promise<string | undefined> {
  try {
    const u = new URL(url);
    
    if (chrome.favicon && chrome.favicon.getFaviconUrl) {
      const faviconUrl = chrome.favicon.getFaviconUrl({
        url: url,
        size: FAVICON_SIZE
      });
      return faviconUrl;
    }
    
    const host = u.hostname;
    const faviconUrls = [
      `${u.origin}/favicon.ico`,
      `${u.origin}/favicon.png`,
      `${u.origin}/favicon.svg`,
      `${u.origin}/apple-touch-icon.png`,
      `${u.origin}/apple-touch-icon-precomposed.png`
    ];
    
    for (const faviconUrl of faviconUrls) {
      try {
        const response = await fetch(faviconUrl, { 
          mode: 'no-cors',
          cache: 'force-cache' 
        });
        
        if (response.type === 'opaque' || response.ok) {
          const blob = await response.blob();
          if (blob.size > 0) {
            return await blobToDataUrl(blob);
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${FAVICON_SIZE}`;
  } catch (e) {
    console.warn('Failed to fetch favicon:', e);
    return undefined;
  }
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function getCachedFavicon(host: string): Promise<string | undefined> {
  return new Promise((resolve) => {
    if (!chrome.storage || !chrome.storage.local) {
      resolve(undefined);
      return;
    }
    
    const key = `${FAVICON_CACHE_PREFIX}${host}`;
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime && chrome.runtime.lastError) {
        console.warn('Failed to get cached favicon:', chrome.runtime.lastError);
        resolve(undefined);
        return;
      }
      
      const cached = result[key] as CachedFavicon | undefined;
      if (cached && cached.version === FAVICON_CACHE_VERSION) {
        resolve(cached.dataUrl);
      } else {
        resolve(undefined);
      }
    });
  });
}

async function setCachedFavicon(host: string, dataUrl: string): Promise<void> {
  return new Promise((resolve) => {
    if (!chrome.storage || !chrome.storage.local) {
      resolve();
      return;
    }
    
    const key = `${FAVICON_CACHE_PREFIX}${host}`;
    const cached: CachedFavicon = {
      version: FAVICON_CACHE_VERSION,
      dataUrl,
      timestamp: Date.now()
    };
    
    chrome.storage.local.set({ [key]: cached }, () => {
      if (chrome.runtime && chrome.runtime.lastError) {
        console.warn('Failed to cache favicon:', chrome.runtime.lastError);
      }
      resolve();
    });
  });
}

export async function getFaviconURL(url: string): Promise<string | undefined> {
  try {
    const u = new URL(url);
    const host = u.hostname;
    
    const cached = await getCachedFavicon(host);
    if (cached) {
      return cached;
    }
    
    const faviconDataUrl = await fetchFaviconFromSite(url);
    if (faviconDataUrl) {
      await setCachedFavicon(host, faviconDataUrl);
      return faviconDataUrl;
    }
    
    return undefined;
  } catch (e) {
    console.warn('Error getting favicon:', e);
    return undefined;
  }
}

export async function clearFaviconCache(): Promise<void> {
  return new Promise((resolve) => {
    if (!chrome.storage || !chrome.storage.local) {
      resolve();
      return;
    }
    
    chrome.storage.local.get(null, (items) => {
      const keysToRemove = Object.keys(items).filter(key => 
        key.startsWith(FAVICON_CACHE_PREFIX)
      );
      
      if (keysToRemove.length > 0) {
        chrome.storage.local.remove(keysToRemove, () => {
          if (chrome.runtime && chrome.runtime.lastError) {
            console.warn('Failed to clear favicon cache:', chrome.runtime.lastError);
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
}