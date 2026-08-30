import './touch-targets.css';

const offline = document.getElementById('offline-banner');
const updateNetwork = () => { if (offline) offline.hidden = navigator.onLine; };
window.addEventListener('online', updateNetwork);
window.addEventListener('offline', updateNetwork);
updateNetwork();

if ('serviceWorker' in navigator) window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'));
