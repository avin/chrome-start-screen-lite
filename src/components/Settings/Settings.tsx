import { Component, createSignal } from 'solid-js';
import styles from './Settings.module.scss';
import Button from '../Button/Button';
import { useStore } from '../../store/store';
import { Bookmark } from '../../types';

interface ExportData {
  version: '1.0';
  bookmarks: Bookmark[];
  timestamp: string;
}

const Settings: Component<{
  onClose: () => void;
}> = (props) => {
  const { state, actions } = useStore();
  const [importError, setImportError] = createSignal<string>('');
  
  const handleExport = async () => {
    const bookmarksWithIcons = await new Promise<Bookmark[]>((resolve) => {
      if (!chrome.storage || !chrome.storage.local) {
        resolve(state.bookmarks);
        return;
      }
      
      const iconKeys = state.bookmarks.map(b => `icon:${b.id}`);
      chrome.storage.local.get(iconKeys, (icons) => {
        const withIcons = state.bookmarks.map(b => {
          const iconDataUrl = icons[`icon:${b.id}`] as string | undefined;
          return iconDataUrl ? { ...b, iconDataUrl } : b;
        });
        resolve(withIcons);
      });
    });
    
    const exportData: ExportData = {
      version: '1.0',
      bookmarks: bookmarksWithIcons,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `start-screen-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const handleImport = (file: File) => {
    setImportError('');
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as ExportData;
        
        if (!data.version || !data.bookmarks || !Array.isArray(data.bookmarks)) {
          throw new Error(chrome.i18n.getMessage('invalidFileFormat'));
        }
        
        for (const bookmark of data.bookmarks) {
          if (!bookmark.id || !bookmark.title || !bookmark.url || !bookmark.position) {
            throw new Error(chrome.i18n.getMessage('invalidBookmarkData'));
          }
        }
        
        await actions.importBookmarks(data.bookmarks);
        
        props.onClose();
      } catch (err) {
        setImportError((err as Error).message || chrome.i18n.getMessage('importFailed'));
      }
    };
    
    reader.onerror = () => {
      setImportError(chrome.i18n.getMessage('fileReadError'));
    };
    
    reader.readAsText(file);
  };
  
  let fileInputRef: HTMLInputElement | undefined;
  
  return (
    <div class={styles.overlay}>
      <div class={styles.dialog}>
        <div class={styles.title}>
          {chrome.i18n.getMessage('settings')}
        </div>
        
        <div class={styles.body}>
          <div class={styles.section}>
            <div class={styles.sectionTitle}>
              {chrome.i18n.getMessage('exportSettings')}
            </div>
            <div class={styles.sectionDescription}>
              {chrome.i18n.getMessage('exportDescription')}
            </div>
            <div class={styles.buttonGroup}>
              <Button onClick={handleExport}>
                {chrome.i18n.getMessage('exportToFile')}
              </Button>
            </div>
          </div>
          
          <div class={styles.section}>
            <div class={styles.sectionTitle}>
              {chrome.i18n.getMessage('importSettings')}
            </div>
            <div class={styles.sectionDescription}>
              {chrome.i18n.getMessage('importDescription')}
            </div>
            {importError() && (
              <div style={{ color: 'var(--error-color, #d93025)', 'margin-bottom': '12px', 'font-size': '13px' }}>
                {importError()}
              </div>
            )}
            <div class={styles.buttonGroup}>
              <Button onClick={() => fileInputRef?.click()}>
                {chrome.i18n.getMessage('importFromFile')}
              </Button>
              <input
                ref={(el) => (fileInputRef = el)}
                type="file"
                accept=".json"
                class={styles.fileInput}
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  if (file) {
                    handleImport(file);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        <div class={styles.footer}>
          <Button onClick={props.onClose}>
            {chrome.i18n.getMessage('close')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;