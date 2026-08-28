export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'say-it-right-add',
      title: 'Add pronunciation cue for “%s”',
      contexts: ['selection']
    });
  });

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== 'say-it-right-add' || !info.selectionText) return;
    await chrome.storage.local.set({
      pendingSelection: {
        text: info.selectionText.slice(0, 12_000),
        url: tab?.url ?? '',
        capturedAt: Date.now(),
        openCueForm: true
      }
    });
    await chrome.action.setBadgeText({ text: '1', tabId: tab?.id });
    await chrome.action.setBadgeBackgroundColor({ color: '#D84A2F' });
    try {
      await chrome.action.openPopup();
    } catch {
      // Some browsers do not support opening a popup from a context-menu event.
    }
  });
});
