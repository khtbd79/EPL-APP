import { AppState } from '../types';

export interface ExportResult {
  success: boolean;
  method: 'share_file' | 'share_text' | 'download_blob' | 'data_uri' | 'clipboard' | 'cancelled_by_user';
  message: string;
}

/**
 * Universal Mobile & Desktop JSON Backup Exporter
 * Handles WebView / WebIntoApp APK limitations where blob: downloads fail.
 */
export async function exportBackupJson(state: AppState): Promise<ExportResult> {
  const jsonString = JSON.stringify(state, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `epl_pro_backup_${dateStr}.json`;

  // 1. Check if running inside mobile with Web Share API supporting files
  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
    try {
      const file = new File([jsonString], filename, { type: 'application/json' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'EPL Pro Match Center - Backup',
          text: `EPL 26 Data Backup (${dateStr})`,
          files: [file],
        });
        return {
          success: true,
          method: 'share_file',
          message: 'Backup shared / saved successfully via system dialog.',
        };
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return {
          success: true,
          method: 'cancelled_by_user',
          message: 'Share dialog closed.',
        };
      }
      console.warn('Web Share file failed, attempting fallbacks:', err);
    }
  }

  // 2. Standard Blob Download with delayed URL revocation
  try {
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // Delay revocation by 30 seconds so WebView/browser download manager has time to read it
    setTimeout(() => {
      try {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (e) {}
    }, 30000);

    return {
      success: true,
      method: 'download_blob',
      message: 'Download initiated.',
    };
  } catch (blobErr) {
    console.warn('Blob download failed, trying data URI fallback:', blobErr);
  }

  // 3. Fallback to Data URI
  try {
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonString);
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = filename;
    link.target = '_blank';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        document.body.removeChild(link);
      } catch (e) {}
    }, 5000);

    return {
      success: true,
      method: 'data_uri',
      message: 'Data URI download initiated.',
    };
  } catch (dataUriErr) {
    console.warn('Data URI failed:', dataUriErr);
  }

  // 4. Ultimate Fallback: Copy to Clipboard
  try {
    await copyTextToClipboard(jsonString);
    return {
      success: true,
      method: 'clipboard',
      message: 'Backup JSON copied to clipboard.',
    };
  } catch (copyErr) {
    return {
      success: false,
      method: 'clipboard',
      message: 'Could not export or copy backup.',
    };
  }
}

/**
 * Robust copy text to clipboard with legacy execCommand fallback for older WebViews
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.warn('navigator.clipboard failed, attempting execCommand:', e);
    }
  }

  // Fallback for WebViews without clipboard permission
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '2em';
    textarea.style.height = '2em';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    console.error('execCommand copy failed:', err);
    return false;
  }
}

/**
 * Validate and parse backup JSON
 */
export function validateBackupJson(jsonString: string): { valid: boolean; state?: AppState; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed !== 'object' || parsed === null) {
      return { valid: false, error: 'File content is not a valid JSON object.' };
    }
    if (!Array.isArray(parsed.matchHistory)) {
      return { valid: false, error: 'Missing core match history array.' };
    }
    return { valid: true, state: parsed as AppState };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Failed to parse JSON string.' };
  }
}
