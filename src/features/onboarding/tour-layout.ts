export type TourRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, Math.max(min, max)));

export function getTourLayout(
  target: TourRect | null,
  viewport: { width: number; height: number },
  cardHeight: number,
) {
  const margin = 16;
  const gap = 18;
  const width = Math.min(400, viewport.width - margin * 2);
  const height = Math.min(cardHeight, viewport.height - margin * 2);
  let left = (viewport.width - width) / 2;
  let top = viewport.height - height - margin;
  // Match the dashboard's single-column layout, including tablets.
  const mobile = viewport.width < 1100;
  let clipAboveCard = mobile;
  if (target && !mobile) {
    const right = target.left + target.width;
    const bottom = target.top + target.height;
    if (right + gap + width <= viewport.width - margin) {
      left = right + gap;
      top = target.top;
    } else if (target.left - gap - width >= margin) {
      left = target.left - gap - width;
      top = target.top;
    } else {
      left = target.left + (target.width - width) / 2;
      if (bottom + gap + height <= viewport.height - margin) top = bottom + gap;
      else if (target.top - gap - height >= margin)
        top = target.top - gap - height;
      else clipAboveCard = true;
    }
  }
  const card = {
    left: clamp(left, margin, viewport.width - width - margin),
    top: clamp(top, margin, viewport.height - height - margin),
    width,
  };
  if (!target) return { card, spotlight: null };
  const x = clamp(target.left - 6, 8, viewport.width - 8);
  const y = clamp(target.top - 6, 8, viewport.height - 8);
  const right = clamp(target.left + target.width + 6, x, viewport.width - 8);
  const bottom = clamp(
    target.top + target.height + 6,
    y,
    clipAboveCard ? card.top - gap : viewport.height - 8,
  );
  const spotlight = { left: x, top: y, width: right - x, height: bottom - y };
  return {
    card,
    spotlight: spotlight.width > 0 && spotlight.height > 0 ? spotlight : null,
  };
}
