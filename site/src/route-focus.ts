/** Give document-route changes an announced, reliable reading start. */
export function focusRouteHeading(): void {
  if (window.location.hash) return;
  const heading = document.querySelector<HTMLElement>('main h1');
  if (!heading) return;

  const announcement = document.createElement('p');
  announcement.className = 'route-announcement';
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  document.body.append(announcement);

  window.requestAnimationFrame(() => {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    announcement.textContent = `${heading.textContent?.trim() ?? document.title}.`;
  });
}
