export function normalizeUrl(url: string): string {
  if (!/^https?:\/\//.test(url)) {
    return `https://${url}`;
  }
  return url;
}