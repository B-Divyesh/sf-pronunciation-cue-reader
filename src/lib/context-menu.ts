export const CONTEXT_MENU_ID = 'say-it-right-add';
export const CONTEXT_MENU_TITLE = 'Add pronunciation cue for “%s”';

type ContextMenuClick = { menuItemId: string | number; selectionText?: string };
type ContextTab = { id?: number; url?: string };

export type ContextMenuDependencies = {
  now: () => number;
  storePendingSelection: (value: { pendingSelection: { text: string; url: string; capturedAt: number; openCueForm: true } }) => Promise<void>;
  setBadgeText: (details: { text: string; tabId?: number }) => Promise<void>;
  setBadgeBackgroundColor: (details: { color: string }) => Promise<void>;
  openPopup: () => Promise<void>;
};

export async function handleSelectionContextMenu(
  info: ContextMenuClick,
  tab: ContextTab | undefined,
  dependencies: ContextMenuDependencies
): Promise<boolean> {
  if (info.menuItemId !== CONTEXT_MENU_ID || !info.selectionText) return false;

  await dependencies.storePendingSelection({
    pendingSelection: {
      text: info.selectionText.slice(0, 12_000),
      url: tab?.url ?? '',
      capturedAt: dependencies.now(),
      openCueForm: true
    }
  });
  await dependencies.setBadgeText({ text: '1', tabId: tab?.id });
  await dependencies.setBadgeBackgroundColor({ color: '#D84A2F' });
  try {
    await dependencies.openPopup();
  } catch {
    // Some browsers do not support opening a popup from a context-menu event.
  }
  return true;
}
