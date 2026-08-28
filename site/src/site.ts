import { LICENSE_KEY, LICENSE_CACHE_KEY, verifyLicense } from '../../src/lib/license';

const input = document.getElementById('site-license') as HTMLInputElement | null;
const status = document.getElementById('license-status');
const query = new URLSearchParams(location.search);
const returnedLicense = query.get('license');

if (returnedLicense) {
  localStorage.setItem(LICENSE_KEY, returnedLicense);
  input && (input.value = returnedLicense);
  history.replaceState({}, '', `${location.pathname}${location.hash}`);
  if (status) status.textContent = 'Purchase received. Copy this token into the extension to unlock Plus.';
}

if (input && !input.value) input.value = localStorage.getItem(LICENSE_KEY) ?? '';

document.getElementById('copy-license')?.addEventListener('click', async () => {
  if (!input?.value) { if (status) status.textContent = 'No license is stored on this site yet.'; return; }
  try { await navigator.clipboard.writeText(input.value); if (status) status.textContent = 'License copied. Paste it into Backup and Plus in the extension.'; }
  catch { input.select(); if (status) status.textContent = 'Copy was blocked. The token is selected; use your browser’s copy command.'; }
});

document.getElementById('verify-license')?.addEventListener('click', async () => {
  const token = input?.value.trim();
  if (!token) { if (status) status.textContent = 'Paste a license token first.'; return; }
  if (status) status.textContent = 'Checking license…';
  try {
    const result = await verifyLicense(token);
    localStorage.setItem(LICENSE_KEY, token);
    localStorage.setItem(LICENSE_CACHE_KEY, JSON.stringify(result));
    if (status) status.textContent = result.valid ? 'License active. Copy it into the extension to unlock Plus.' : 'This license is not active. Check the token or purchase Plus.';
  } catch { if (status) status.textContent = 'Could not verify right now. Check your connection and try again.'; }
});

const offline = document.getElementById('offline-banner');
const updateNetwork = () => { if (offline) offline.hidden = navigator.onLine; };
window.addEventListener('online', updateNetwork);
window.addEventListener('offline', updateNetwork);
updateNetwork();

if ('serviceWorker' in navigator) window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'));
