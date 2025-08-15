export function getFaviconURL(url: string): string | undefined {
  try {
    const u = new URL(url);
    const host = u.hostname;
    // Cross-browser, no permissions needed. Alternatives if desired:
    // - https://icons.duckduckgo.com/ip3/${host}.ico
    // - https://icon.horse/icon/${host}
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
      host,
    )}&sz=32`;
  } catch {
    return undefined;
  }
}
