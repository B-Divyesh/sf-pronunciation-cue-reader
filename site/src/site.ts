import './touch-targets.css';
import { focusRouteHeading } from './route-focus';

if (window.location.pathname === '/' && new URLSearchParams(window.location.search).get('demo') === '1') {
  window.location.replace('/demo/?demo=1');
}

const offline = document.getElementById('offline-banner');
const updateNetwork = () => { if (offline) offline.hidden = navigator.onLine; };
window.addEventListener('online', updateNetwork);
window.addEventListener('offline', updateNetwork);
updateNetwork();

focusRouteHeading();

if ('serviceWorker' in navigator) window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'));
