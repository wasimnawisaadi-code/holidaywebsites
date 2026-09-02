/**
 * Picks the right-sized file for a slot.
 *
 * The destination photography is stored at 1600px because the country and
 * package heroes display it that wide. The same files were also being served
 * into 360px marquee tiles and card thumbnails, where a 603KB photograph is
 * roughly twenty times more pixels than the screen can paint — twenty-one of
 * them loaded on the homepage before a visitor had scrolled at all.
 *
 * scripts/generate-thumbnails.mjs writes a 720px `-sm.webp` beside each one.
 * These helpers offer both through srcset so the browser chooses, rather than
 * the markup guessing on its behalf.
 */

/** The 720px variant, if the path is one the thumbnail script covers. */
export function thumbOf(src: string): string | null {
  if (!src.startsWith("/images/destinations/")) return null;
  if (src.includes("-sm.")) return null;
  return src.replace(/\.(webp|jpe?g|png)$/i, "-sm.webp");
}

/**
 * srcset/sizes for an image rendered in a small tile.
 *
 * Returns nothing when there is no thumbnail for the path, so a caller can
 * spread the result unconditionally and images outside the destinations
 * folder simply carry on being served at their single size.
 */
export function tileImage(src: string, sizes: string): { srcSet?: string; sizes?: string } {
  const sm = thumbOf(src);
  if (!sm) return {};
  return { srcSet: `${sm} 720w, ${src} 1600w`, sizes };
}
