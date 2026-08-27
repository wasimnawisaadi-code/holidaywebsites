import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import * as THREE from "three";
import { ArrowRight } from "lucide-react";
import { clamp, damp, lerp, prefersReducedMotion, useScrollProgressRef } from "@/lib/scroll";

/**
 * Scroll-driven journey tunnel.
 *
 * Destination plates are laid out along the Z axis in a gentle horizontal
 * serpentine. Scroll flies the camera *through* them: plates rush past on either
 * side, and the one nearest the camera centres up, straightens and lights while
 * its neighbours bank away and dim.
 *
 * This is the page's "talking" set piece — vertical scroll input, horizontal
 * lateral travel, real perspective depth. Camera position is a pure function of
 * scroll progress (only the easing is damped), so it scrubs identically both
 * ways and cannot drift.
 *
 * Falls back to a static grid when WebGL is unavailable or motion is reduced.
 */

export type TunnelStop = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  price: string;
};

const GAP = 7.4; // Z distance between plates
const SWAY = 3.5; // how far left/right the serpentine swings
const CARD_W = 4.6;
const CARD_H = 3.0;

export function JourneyTunnel({ stops }: { stops: TunnelStop[] }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [fallback, setFallback] = useState(false);
  const progress = useRef(0);

  const sectionRef = useScrollProgressRef<HTMLElement>((p) => {
    progress.current = p;
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !stops.length) return;
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
    scene.fog = new THREE.Fog(0x04121f, GAP * 1.6, GAP * 5.2);

    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 200);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      width: "100%",
      height: "100%",
      display: "block",
    });

    const loader = new THREE.TextureLoader();
    const plates: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];

    // Where plate i sits: marching away in Z, swinging side to side in X.
    const xAt = (i: number) => Math.sin(i * 0.9) * SWAY;
    const zAt = (i: number) => -i * GAP;

    stops.forEach((stop, i) => {
      const geo = new THREE.PlaneGeometry(CARD_W, CARD_H, 1, 1);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      loader.load(stop.image, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        mat.map = tex;
        mat.needsUpdate = true;
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(xAt(i), Math.sin(i * 1.7) * 0.5, zAt(i));
      plates.push(mesh);
      scene.add(mesh);
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
    let travel = 0;
    let lastActive = -1;
    const tmp = new THREE.Vector3();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Scroll maps to distance travelled down the tunnel, in plate units.
      const target = progress.current * (stops.length - 1);
      travel = damp(travel, target, 0.07, dt);

      // Camera rides just behind the current plate, swinging with the serpentine
      // so the path reads as a route rather than a straight corridor.
      const camIdx = travel;
      const camX = Math.sin(camIdx * 0.9) * SWAY * 0.55;
      const camZ = -camIdx * GAP + GAP * 0.92;
      camera.position.set(camX, 0.35, camZ);
      camera.lookAt(Math.sin((camIdx + 1.1) * 0.9) * SWAY * 0.5, 0, -(camIdx + 2.2) * GAP);

      let bestIdx = 0;
      let bestDist = Infinity;

      for (let i = 0; i < plates.length; i++) {
        const mesh = plates[i];
        if (!mesh) continue;

        // Distance from the camera along the tunnel, in plate units.
        const d = i - travel;
        const ahead = d >= -0.6;
        const absd = Math.abs(d);

        // Only plates within the fog volume are worth drawing.
        mesh.visible = ahead && absd < 5.2;
        if (!mesh.visible) continue;

        // Nearest plate straightens and centres; the rest bank away.
        const focus = clamp(1 - absd / 1.25);
        mesh.position.x = lerp(xAt(i), camX, focus * 0.72);
        mesh.rotation.y = lerp(-Math.cos(i * 0.9) * 0.42, 0, focus);
        mesh.scale.setScalar(lerp(0.88, 1.12, focus));

        // Fade in from the fog, and out as it passes the camera.
        const near = clamp((d + 0.6) / 0.8);
        const far = clamp((5.2 - absd) / 1.8);
        mesh.material.opacity = Math.min(near, far) * lerp(0.55, 1, focus);
        const shade = lerp(0.5, 1, focus);
        mesh.material.color.setRGB(shade, shade, shade);

        mesh.getWorldPosition(tmp);
        const camDist = tmp.distanceTo(camera.position);
        if (d > -0.4 && camDist < bestDist) {
          bestDist = camDist;
          bestIdx = i;
        }
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
      plates.forEach((m) => {
        m.geometry.dispose();
        m.material.map?.dispose();
        m.material.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [stops]);

  const current = stops[active] ?? stops[0];

  if (fallback) {
    return (
      <section className="bg-[#04121f] py-20">
        <div className="mx-auto grid max-w-[1400px] gap-6 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
          {stops.map((s) => (
            <Link
              key={s.slug}
              to="/countries/$slug"
              params={{ slug: s.slug }}
              className="group overflow-hidden rounded-sm bg-white/5"
            >
              <img src={s.image} alt={s.name} className="aspect-[3/2] w-full object-cover" />
              <div className="p-5">
                <p className="font-display text-lg text-white">{s.name}</p>
                <p className="mt-1 font-sans text-xs text-white/60">{s.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#04121f]"
      style={{ height: `${Math.max(stops.length, 3) * 62}vh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* The tunnel */}
        <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />

        {/* Heading */}
        <div className="pointer-events-none absolute inset-x-0 top-0 pt-28">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-[#CAA42D]" />
              <p className="font-sans text-[11px] font-medium uppercase tracking-[0.28em] text-[#DDBE5E]">
                The journey
              </p>
            </div>
            <h2 className="mt-4 max-w-2xl font-display text-4xl leading-[1.04] text-white sm:text-6xl">
              Forty destinations,
              <br />
              <span className="italic text-[#DDBE5E]">one travel desk.</span>
            </h2>
          </div>
        </div>

        {/* Caption for the plate the camera is passing */}
        <div className="absolute inset-x-0 bottom-0 pb-14">
          <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
            {current ? (
              <div
                key={current.slug}
                className="flex flex-col gap-4 border-t border-white/15 pt-6 sm:flex-row sm:items-end sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-sans text-[11px] uppercase tracking-[0.24em] text-[#DDBE5E]">
                    {current.price}
                  </p>
                  <p className="mt-2 font-display text-3xl text-white sm:text-5xl">
                    {current.name}
                  </p>
                  <p className="mt-2 max-w-lg font-sans text-sm text-white/65">
                    {current.tagline}
                  </p>
                </div>
                <Link
                  to="/countries/$slug"
                  params={{ slug: current.slug }}
                  className="group inline-flex shrink-0 items-center gap-2 rounded-sm bg-[#CAA42D] px-7 py-3.5 font-sans text-sm font-semibold text-[#04121f] transition-colors hover:bg-[#DDBE5E]"
                >
                  <span>Explore {current.name}</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            ) : null}

            <div className="mt-5 flex items-center gap-1" aria-hidden="true">
              {stops.map((s, i) => (
                <span
                  key={s.slug}
                  className={
                    "h-0.5 flex-1 transition-colors duration-500 " +
                    (i <= active ? "bg-[#CAA42D]" : "bg-white/15")
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
