import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const siteDir = 'dist/site';
const extensionDir = '.output/chrome-mv3';

rmSync(siteDir, { recursive: true, force: true });
rmSync('.output', { recursive: true, force: true });
execFileSync('npm', ['run', 'build:extension'], { stdio: 'inherit' });
execFileSync('vite', ['build', '--config', 'site.vite.config.ts'], { stdio: 'inherit' });

if (!existsSync(join(extensionDir, 'manifest.json'))) throw new Error('Extension build did not produce a manifest.');
mkdirSync('dist/extension', { recursive: true });
rmSync('dist/extension', { recursive: true, force: true });
execFileSync('cp', ['-R', extensionDir, 'dist/extension']);
mkdirSync(join(siteDir, 'downloads'), { recursive: true });
execFileSync('zip', ['-q', '-r', '../site/downloads/say-it-right.zip', '.'], { cwd: 'dist/extension' });

const heroAssets = ['pronunciation-field.webp', 'pronunciation-field.jpg'].map((filename) => {
  const path = join(siteDir, 'assets', filename);
  if (!existsSync(path)) throw new Error(`Expected ${filename} was not emitted.`);
  const hash = createHash('sha256').update(readFileSync(path)).digest('hex').slice(0, 12);
  const hashedName = `${filename.replace(/\.(webp|jpg)$/, '')}-${hash}.${filename.split('.').at(-1)}`;
  renameSync(path, join(siteDir, 'assets', hashedName));
  return [filename, hashedName];
});
for (const page of ['index.html']) {
  const path = join(siteDir, page);
  let html = readFileSync(path, 'utf8');
  for (const [filename, hashedName] of heroAssets) html = html.replaceAll(`/assets/${filename}`, `/assets/${hashedName}`);
  writeFileSync(path, html);
}

const staticAssets = walk(join(siteDir, 'assets'))
  .filter((path) => statSync(path).isFile())
  .map((path) => `/${path.slice(siteDir.length + 1).replaceAll('\\', '/')}`)
  .sort();
const precache = ['/', '/demo/', '/privacy/', '/terms/', '/404.html', '/icon.svg', '/manifest.webmanifest', ...staticAssets];
const cacheId = createHash('sha256').update(precache.join('\n')).digest('hex').slice(0, 12);
const swPath = join(siteDir, 'sw.js');
writeFileSync(swPath, readFileSync(swPath, 'utf8')
  .replace('__CACHE_NAME__', `say-it-right-site-${cacheId}`)
  .replace('__PRECACHE__', JSON.stringify(precache)));

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}
