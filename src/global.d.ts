declare global {
  interface Window {
    debug_setBookmarks: (bookmarks: string) => void;
    debug_dumpBookmarks: () => void;
  }
}

export {};