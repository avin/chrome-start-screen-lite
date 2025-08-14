export function getFaviconURL(url: string): string | undefined {
  if (!chrome.runtime) return undefined;
  
  const faviconUrl = new URL(chrome.runtime.getURL('/_favicon/'));
  faviconUrl.searchParams.set('pageUrl', url);
  faviconUrl.searchParams.set('size', '32');
  return faviconUrl.toString();
}