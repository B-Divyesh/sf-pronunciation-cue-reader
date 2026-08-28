import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
rmSync('.output', { recursive: true, force: true });
execFileSync('npm', ['run', 'build:extension'], { stdio: 'inherit' });
mkdirSync('dist', { recursive: true });
cpSync('.output/chrome-mv3', 'dist/extension', { recursive: true });
execFileSync('npm', ['run', 'build:site'], { stdio: 'inherit' });
mkdirSync('dist/site/downloads', { recursive: true });
if (!existsSync('dist/extension/manifest.json')) throw new Error('Extension build did not produce a manifest.');
execFileSync('zip', ['-q', '-r', '../site/downloads/say-it-right.zip', '.'], { cwd: 'dist/extension' });
