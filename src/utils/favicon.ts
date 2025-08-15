const FAVICON_SIZE = 32;

export function getChromeFaviconUrl(url: string): string | undefined {
  try {
    const faviconUrl = new URL(chrome.runtime.getURL('/_favicon/'));
    faviconUrl.searchParams.set('pageUrl', url);
    faviconUrl.searchParams.set('size', '32');
    return faviconUrl.toString();
  } catch {
    return undefined;
  }
}

export function getGoogleFaviconUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=${FAVICON_SIZE}`;
  } catch {
    return '';
  }
}

export function isChrome(): boolean {
  return typeof chrome !== 'undefined' && 
         typeof chrome.runtime !== 'undefined' &&
         chrome.runtime.getURL !== undefined &&
         !navigator.userAgent.includes('Firefox');
}