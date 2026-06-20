/**
 * Standard dynamic utility for unified lightweight toast notifications and styled popups.
 * Safe to use inside iframe wrappers because it doesn't block the browser thread.
 */

export type ToastType = 'success' | 'warning' | 'info' | 'error';

export function showToast(message: string, type: ToastType = 'info') {
  const event = new CustomEvent('app-toast', {
    detail: { message, type }
  });
  window.dispatchEvent(event);
}

export function showConfirm(message: string, onConfirm: () => void, title?: string) {
  const event = new CustomEvent('app-confirm', {
    detail: { message, onConfirm, title }
  });
  window.dispatchEvent(event);
}
