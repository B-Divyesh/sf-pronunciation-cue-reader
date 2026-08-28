import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: '.',
  outDir: '.output',
  publicDir: 'extension-public',
  manifest: {
    name: 'Say It Right',
    description: 'Remember how names and technical terms should sound, then read selected text aloud.',
    version: '1.0.0',
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      128: 'icon/128.png'
    },
    permissions: ['activeTab', 'storage', 'contextMenus', 'scripting'],
    action: { default_title: 'Open Say It Right' },
    commands: {
      '_execute_action': {
        suggested_key: { default: 'Alt+Shift+S', mac: 'Alt+Shift+S' },
        description: 'Open Say It Right'
      }
    }
  }
});
