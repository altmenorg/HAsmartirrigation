/** Room kept between the bubble and the edges of the screen. */
export const MARGIN = 8;

/**
 * Where the bubble goes: under the icon, from its start, moved back inside the
 * screen when it would leave it, and above the icon when there is no room
 * under it but there is above. Pure, for the tests.
 */
export function placeTip(
  icon: { left: number; right: number; top: number; bottom: number },
  tip: { width: number; height: number },
  viewport: { width: number; height: number },
  rtl = false,
): { x: number; y: number } {
  const maxX = viewport.width - MARGIN - tip.width;
  let x = rtl ? icon.right + 8 - tip.width : icon.left - 8;
  x = Math.max(MARGIN, Math.min(x, maxX));
  let y = icon.bottom + 6;
  const above = icon.top - 6 - tip.height;
  if (y + tip.height > viewport.height - MARGIN && above >= MARGIN) y = above;
  return { x, y };
}
