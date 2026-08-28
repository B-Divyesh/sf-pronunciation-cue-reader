import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
rmSync('.output', { recursive: true, force: true });
execFileSync('npm', ['run', 'build:site'], { stdio: 'inherit' });
mkdirSync('dist', { recursive: true });
if (!existsSync('dist/extension/manifest.json')) throw new Error('Extension build did not produce a manifest.');
