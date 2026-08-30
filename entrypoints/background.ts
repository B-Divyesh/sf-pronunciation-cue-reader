import { CONTEXT_MENU_ID, CONTEXT_MENU_TITLE, handleSelectionContextMenu } from '../src/lib/context-menu';

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: CONTEXT_MENU_TITLE,
      contexts: ['selection']
    });
  });

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    await handleSelectionContextMenu(info, tab, {
      now: Date.now,
      storePendingSelection: (value) => chrome.storage.local.set(value),
      setBadgeText: (details) => chrome.action.setBadgeText(details),
      setBadgeBackgroundColor: (details) => chrome.action.setBadgeBackgroundColor(details),
      openPopup: () => chrome.action.openPopup()
    });
  });
});
