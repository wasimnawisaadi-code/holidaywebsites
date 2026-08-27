/**
 * Decorative horizon that sits above the footer.
 *
 * An original drawing, not a lifted asset: a single navy silhouette band
 * carrying a shoreline, palms, a dhow under sail, a hot-air balloon, a
 * paraglider, travellers with luggage and a headland — the things this agency
 * actually sells, rather than generic scenery.
 *
 * Drawn as one inline SVG so it inherits the brand colour, scales to any width
 * without a raster asset, and costs no network request.
 *
 * Height is left to the aspect ratio rather than fixed: a fixed height with
 * `slice` cropped the top of the frame, which is exactly where the balloons and
 * the paraglider are. Letting it scale proportionally keeps the whole scene.
 */
export function HorizonSilhouette({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <svg
        viewBox="0 0 1440 150"
        className="block h-auto w-full"
        role="presentation"
        focusable="false"
      >
        <g fill="#00365F">
          {/* Ground. A thin dune line, not a filled band: the footer beneath is
              light, so anything thicker reads as a navy stripe across the page
              rather than the ground the figures are standing on. */}
          <path d="M0 128 C 120 118, 240 122, 360 126 C 520 131, 600 120, 700 124 C 820 129, 900 118, 1010 122 C 1120 126, 1240 116, 1440 126 L1440 131 C 1240 121, 1120 131, 1010 127 C 900 123, 820 134, 700 129 C 600 125, 520 136, 360 131 C 240 127, 120 123, 0 133 Z" />

          {/* Left palm cluster */}
          <g transform="translate(52 128)">
            <path d="M-1.6 0 L-1.6 -30 Q -0.6 -38, 1.8 -44 L4 -44 Q 1.4 -37, 0.9 -30 L0.9 0 Z" />
            <path d="M2 -44 Q -9 -50, -19 -46 Q -9 -55, 2 -47 Z" />
            <path d="M2 -44 Q 13 -51, 23 -47 Q 12 -55, 2 -47 Z" />
            <path d="M2 -45 Q -3 -56, -11 -60 Q 1 -58, 3 -47 Z" />
            <path d="M2 -45 Q 8 -56, 17 -59 Q 5 -58, 3 -47 Z" />
          </g>
          <g transform="translate(78 128) scale(0.78)">
            <path d="M-1.6 0 L-1.6 -30 Q -0.6 -38, 1.8 -44 L4 -44 Q 1.4 -37, 0.9 -30 L0.9 0 Z" />
            <path d="M2 -44 Q -9 -50, -19 -46 Q -9 -55, 2 -47 Z" />
            <path d="M2 -44 Q 13 -51, 23 -47 Q 12 -55, 2 -47 Z" />
            <path d="M2 -45 Q 8 -56, 17 -59 Q 5 -58, 3 -47 Z" />
          </g>

          {/* Windsurfer */}
          <g transform="translate(168 128)">
            <path d="M-14 -1 Q 0 -3, 14 -1 L12 2 L-12 2 Z" />
            <path d="M-2 -3 L-2 -34 Q 12 -27, 15 -6 Q 6 -8, -2 -3 Z" />
            <path d="M-4 -3 L-4 -16 L-7 -16 L-7 -3 Z" />
            <circle cx="-5.5" cy="-19" r="3" />
          </g>

          {/* Dhow under sail */}
          <g transform="translate(268 128)">
            <path d="M-34 -2 Q 0 6, 34 -2 L28 4 L-28 4 Z" />
            <path d="M0 -6 L0 -64 L-26 -6 Z" />
            <path d="M4 -6 L4 -46 L22 -6 Z" />
          </g>

          {/* Travellers with a wheeled case */}
          <g transform="translate(388 128)">
            <circle cx="0" cy="-38" r="4.4" />
            <path d="M-4 -33 L4 -33 L5.4 -16 L2 -16 L1.4 -25 L-1.4 -25 L-2 -16 L-5.4 -16 Z" />
            <path d="M-2 -16 L-3.4 0 L-0.6 0 L0.6 -12 L1.8 0 L4.6 0 L3.2 -16 Z" />
            <rect x="9" y="-20" width="11" height="18" rx="1.6" />
            <rect x="13.4" y="-27" width="2" height="7" />
            <path d="M6.5 -25 L14.4 -25 L14.4 -22.6 L6.5 -22.6 Z" />
          </g>
          <g transform="translate(414 128) scale(0.82)">
            <circle cx="0" cy="-38" r="4.4" />
            <path d="M-4 -33 L4 -33 L5.4 -16 L2 -16 L1.4 -25 L-1.4 -25 L-2 -16 L-5.4 -16 Z" />
            <path d="M-2 -16 L-3.4 0 L-0.6 0 L0.6 -12 L1.8 0 L4.6 0 L3.2 -16 Z" />
          </g>

          {/* Hot-air balloons */}
          <g transform="translate(548 0)">
            <path d="M0 12 C -15 12, -22 26, -14 40 Q -7 50, 0 56 Q 7 50, 14 40 C 22 26, 15 12, 0 12 Z" />
            <path d="M-4.4 57 L4.4 57 L3 66 L-3 66 Z" />
            <path d="M-4 56 L-2.6 60 M4 56 L2.6 60" stroke="#00365F" strokeWidth="1" />
          </g>
          <g transform="translate(596 34) scale(0.6)">
            <path d="M0 12 C -15 12, -22 26, -14 40 Q -7 50, 0 56 Q 7 50, 14 40 C 22 26, 15 12, 0 12 Z" />
            <path d="M-4.4 57 L4.4 57 L3 66 L-3 66 Z" />
          </g>
          <g transform="translate(516 52) scale(0.42)">
            <path d="M0 12 C -15 12, -22 26, -14 40 Q -7 50, 0 56 Q 7 50, 14 40 C 22 26, 15 12, 0 12 Z" />
            <path d="M-4.4 57 L4.4 57 L3 66 L-3 66 Z" />
          </g>

          {/* Child mid-jump */}
          <g transform="translate(672 128)">
            <circle cx="0" cy="-46" r="4.2" />
            <path d="M-3.6 -41 L3.6 -41 L4.6 -27 L-4.6 -27 Z" />
            <path d="M-3.6 -40 L-13 -50 L-15 -47.6 L-5.6 -36 Z" />
            <path d="M3.6 -40 L13 -50 L15 -47.6 L5.6 -36 Z" />
            <path d="M-4.6 -27 L-9 -14 L-6 -12.6 L-1.4 -24 Z" />
            <path d="M4.6 -27 L9 -14 L6 -12.6 L1.4 -24 Z" />
          </g>

          {/* Paraglider */}
          <g transform="translate(846 0)">
            <path d="M-42 20 Q 0 4, 42 20 Q 30 26, 20 22 Q 10 27, 0 22 Q -10 27, -20 22 Q -30 26, -42 20 Z" />
            <path d="M-30 23 L-3 46 M0 22 L-1 46 M30 23 L3 46" stroke="#00365F" strokeWidth="1.1" />
            <circle cx="0" cy="50" r="4" />
            <path d="M-3.4 54 L3.4 54 L4.4 66 L-4.4 66 Z" />
            <path d="M-4.4 66 L-6 76 L-3 76 L-1 68 L1 76 L4 76 L2.4 66 Z" />
          </g>

          {/* Headland with a lone pine */}
          <g transform="translate(1076 128)">
            <path d="M-72 0 L-26 -58 Q -18 -68, -10 -58 L34 0 Z" />
          </g>
          <g transform="translate(1128 128)">
            <path d="M0 0 L0 -14 M-13 -8 L0 -50 L13 -8 Z M-10 -20 L0 -46 L10 -20 Z" />
            <rect x="-1.6" y="-16" width="3.2" height="16" />
          </g>

          {/* Right palms */}
          <g transform="translate(1268 128)">
            <path d="M-1.6 0 L-1.6 -30 Q -0.6 -38, 1.8 -44 L4 -44 Q 1.4 -37, 0.9 -30 L0.9 0 Z" />
            <path d="M2 -44 Q -9 -50, -19 -46 Q -9 -55, 2 -47 Z" />
            <path d="M2 -44 Q 13 -51, 23 -47 Q 12 -55, 2 -47 Z" />
            <path d="M2 -45 Q -3 -56, -11 -60 Q 1 -58, 3 -47 Z" />
            <path d="M2 -45 Q 8 -56, 17 -59 Q 5 -58, 3 -47 Z" />
          </g>

          {/* Far dhow */}
          <g transform="translate(1372 128) scale(0.8)">
            <path d="M-30 -2 Q 0 5, 30 -2 L25 4 L-25 4 Z" />
            <path d="M0 -6 L0 -56 L-23 -6 Z" />
            <path d="M4 -6 L4 -40 L20 -6 Z" />
          </g>
        </g>
      </svg>
    </div>
  );
}
