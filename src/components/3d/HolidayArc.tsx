import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import * as THREE from "three";
import { clamp, damp, easeInOut, lerp, prefersReducedMotion, useScrollProgressRef } from "@/lib/scroll";

/**
 * The signature set piece of the landing page: the holiday packages laid out on
 * a curved arc in real 3D space, scrubbed by scroll.
 *
 * Each package is a textured plane on a cylinder segment. Scroll rotates the
 * cylinder so packages sweep through the front of frame; the centre-most card
 * lifts toward camera and lights up while its neighbours fall back and desaturate.
 *
 * Deliberately real WebGL rather than CSS 3D: the cards need perspective-correct
 * curvature and per-card lighting that CSS transforms cannot do without seams.
 * Everything is a pure function of scroll progress, so it scrubs identically in
 * both directions. Falls back to a static grid when WebGL or motion is unavailable.
 */

export type ArcCard = {
  slug: string;
  title: string;
  country: string;
  nights: string;
  price: string;
  image: string;
};

const CARD_W = 2.5;
const CARD_H = 3.35;
const RADIUS = 7.4;

export function HolidayArc({ cards }: { cards: ArcCard[] }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [fallback, setFallback] = useState(false);
  const progressRef = useRef(0);

  const sectionRef = useScrollProgressRef<HTMLElement>((p) => {
    progressRef.current = p;
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (prefersReducedMotion()) {
      setFallback(true);
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setFallback(true);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.05, 5.4);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    // The arc rig: one group rotated by scroll, cards parented onto its rim.
    // Pushed back by RADIUS so the rim's front point sits at the world origin,
    // directly in front of the camera — without this the cylinder is centred on
    // the camera and the facing card sits behind it.
    const rig = new THREE.Group();
    rig.position.z = -RADIUS;
    scene.add(rig);

    const loader = new THREE.TextureLoader();
    const step = (Math.PI * 2) / Math.max(cards.length, 1);
    const meshes: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];

    cards.forEach((card, i) => {
      const geo = new THREE.PlaneGeometry(CARD_W, CARD_H, 24, 24);
      // Bow each plane slightly so it sits flush on the cylinder rather than
      // chording across it — this is what sells the arc as curved glass.
      const pos = geo.attributes["position"] as THREE.BufferAttribute;
      for (let v = 0; v < pos.count; v++) {
        const x = pos.getX(v);
        pos.setZ(v, -(x * x) / (2 * RADIUS));
      }
      pos.needsUpdate = true;
      geo.computeVertexNormals();

      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        side: THREE.DoubleSide,
      });
      loader.load(card.image, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        mat.map = tex;
        mat.needsUpdate = true;
      });

      const mesh = new THREE.Mesh(geo, mat);
      const a = i * step;
      // Cards sit ON the cylinder, centred on the rig's own origin. The rig is
      // then pushed back as a whole (below) — offsetting each card by -RADIUS
      // here instead would make the rig orbit an off-centre pivot, so cards
      // would slide sideways rather than turn into frame.
      mesh.position.set(Math.sin(a) * RADIUS, 0, Math.cos(a) * RADIUS);
      mesh.rotation.y = a;
      mesh.userData["angle"] = a;
      rig.add(mesh);
      meshes.push(mesh);
    });

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let raf = 0;
    let last = performance.now();
    let spin = 0;
    let lastActive = -1;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Scroll drives a little over one full revolution across the section.
      // Damping is kept short: a slower follow looks smoother in isolation but
      // lets the caption trail the card that is actually front-of-frame.
      const target = easeInOut(progressRef.current) * step * (cards.length - 1);
      spin = damp(spin, target, 0.055, dt);
      rig.rotation.y = -spin;

      // Per-card: front-most card comes forward and reaches full opacity.
      // A card sits at `angle` on a rig rotated by -spin, so it faces the camera
      // when angle === spin. Comparing cos of that difference keeps the caption
      // locked to whichever card is actually front-of-frame.
      let bestIdx = 0;
      let bestDot = -Infinity;
      for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes[i];
        if (!mesh) continue;
        const a = (mesh.userData["angle"] as number) - spin;
        const facing = Math.cos(a); // 1 when directly facing camera
        if (facing > bestDot) {
          bestDot = facing;
          bestIdx = i;
        }
        const t = clamp((facing + 1) / 2);
        // Sharpen the falloff so only the genuinely-facing card reads as active;
        // with a soft curve its neighbours stayed bright and the eye could not
        // tell which card the caption belonged to.
        const lift = Math.pow(t, 14);
        mesh.position.y = lerp(-0.1, 0.1, lift);
        mesh.scale.setScalar(lerp(0.82, 1.06, lift));
        // Cards on the far side of the cylinder face away — hide them entirely
        // rather than letting them show through the front row.
        mesh.visible = facing > -0.05;
        // On the light stage, receding cards fade toward the paper rather than
        // darkening: multiplying the texture toward black (as the dark build
        // did) reads as grime against a near-white ground.
        mesh.material.opacity = lerp(0.16, 1, Math.pow(t, 3));
        mesh.material.color.setRGB(1, 1, 1);
        mesh.renderOrder = Math.round(t * 100);
      }

      if (bestIdx !== lastActive) {
        lastActive = bestIdx;
        setActive(bestIdx);
      }

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      meshes.forEach((m) => {
        m.geometry.dispose();
        m.material.map?.dispose();
        m.material.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [cards]);

  const current = cards[active] ?? cards[0];

  // Static, fully-linked fallback — no WebGL, no motion, same content.
  if (fallback) {
    return (
      <section className="bg-[#FFFFFF] py-20">
        <div className="mx-auto grid max-w-[1400px] gap-6 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
          {cards.map((c) => (
            <Link
              key={c.slug}
              to="/holidays/$slug"
              params={{ slug: c.slug }}
              className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all hover:border-[#CAA42D] hover:shadow-xl"
            >
              <img src={c.image} alt={c.title} className="aspect-[3/4] w-full object-cover" />
              <div className="p-5">
                <p className="font-display text-lg text-[#00365F]">{c.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {c.country} · {c.nights}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#8F7420]">{c.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-[320vh] bg-[#F8F8F8]">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        {/* Glow backdrop */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 size-[620px] -translate-x-1/2 rounded-full bg-[#CAA42D]/10 blur-[150px]" />
        </div>

        <div className="mx-auto w-full max-w-[1400px] px-5 pt-20 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#CAA42D]" />
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8F7420]">
              3D Curated Showcase
            </p>
          </div>
          <h2 className="mt-3 max-w-2xl font-display text-3xl leading-[1.05] text-[#00365F] sm:text-5xl">
            Worldwide journeys, <span className="italic text-[#8F7420]">curated in 3D</span> from Dubai.
          </h2>
        </div>

        {/* The arc itself */}
        <div ref={mountRef} className="relative min-h-0 w-full flex-1" aria-hidden="true" />

        {/* Caption for the card currently facing the camera */}
        <div className="mx-auto w-full max-w-[1400px] px-5 pb-10 sm:px-8">
          {current ? (
            <div className="flex flex-col items-start justify-between gap-4 border-t border-[#E5E5E5] pt-5 sm:flex-row sm:items-end">
              <div className="min-w-0">
                <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#8F7420]">
                  {current.country} · {current.nights}
                </p>
                <p className="mt-1 font-display text-2xl text-[#00365F] sm:text-3xl">
                  {current.title}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-5">
                <span className="font-display text-xl font-bold text-[#00365F]">{current.price}</span>
                <Link
                  to="/holidays/$slug"
                  params={{ slug: current.slug }}
                  className="rounded-xl bg-[#00365F] px-6 py-3 text-xs font-bold text-white transition-colors hover:bg-[#CAA42D] hover:text-[#00365F]"
                >
                  View Itinerary
                </Link>
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex items-center gap-1.5" aria-hidden="true">
            {cards.map((c, i) => (
              <span
                key={c.slug}
                className={
                  "h-0.5 flex-1 transition-colors duration-300 " +
                  (i === active ? "bg-[#CAA42D]" : "bg-slate-200")
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
