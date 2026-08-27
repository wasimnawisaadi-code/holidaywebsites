import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import * as THREE from "three";
import { clamp, damp, easeInOut, lerp, prefersReducedMotion } from "@/lib/scroll";
import {
  globeMarkers,
  latLonToVec3,
  HOME,
  type GlobeMarker,
} from "@/data/globe-markers";
import {
  Compass,
  Plane,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Sparkles,
  MapPin,
  ArrowRight,
  Globe as GlobeIcon,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const RADIUS = 1;
const MARKER_LIFT = 1.015;

/* ------------------------------------------------------------------ *
 * Realistic High-Detail Continents Polygons
 * ------------------------------------------------------------------ */
const LAND_POLYGONS: number[][][] = [
  // Africa + Arabia
  [
    [-17, 21], [-16, 14], [-11, 6], [-4, 5], [6, 4], [9, 4], [13, -5], [12, -17],
    [15, -28], [20, -35], [27, -34], [33, -26], [40, -16], [41, -11], [40, -3],
    [43, 1], [51, 12], [44, 12], [39, 15], [43, 12], [51, 19], [57, 24], [48, 29],
    [35, 29], [34, 28], [33, 22], [25, 22], [10, 25], [-6, 27], [-13, 27], [-17, 21],
  ],
  // Eurasia
  [
    [-10, 36], [-9, 44], [-2, 43], [3, 42], [9, 41], [12, 38], [16, 38], [19, 40],
    [24, 35], [28, 36], [36, 36], [36, 31], [34, 30], [43, 40], [50, 40], [53, 37],
    [57, 25], [61, 25], [67, 25], [72, 19], [77, 8], [80, 13], [87, 21], [92, 21],
    [95, 16], [99, 10], [104, 1], [109, 11], [108, 21], [113, 22], [122, 30],
    [122, 40], [126, 35], [129, 43], [135, 45], [143, 45], [140, 52], [143, 59],
    [162, 61], [170, 66], [180, 65], [180, 70], [160, 70], [140, 73], [113, 74],
    [90, 76], [70, 73], [60, 70], [40, 68], [30, 70], [20, 70], [10, 63], [5, 59],
    [8, 56], [3, 52], [-2, 49], [-5, 43], [-10, 36],
  ],
  // British Isles
  [[-6, 50], [-5, 55], [-3, 58], [1, 53], [-2, 51], [-6, 50]],
  // North America
  [
    [-168, 66], [-166, 60], [-152, 57], [-135, 57], [-125, 49], [-122, 37],
    [-117, 32], [-110, 23], [-105, 20], [-97, 16], [-92, 15], [-88, 21],
    [-97, 26], [-94, 29], [-88, 30], [-81, 25], [-80, 32], [-75, 35], [-70, 42],
    [-66, 45], [-60, 47], [-56, 51], [-64, 60], [-78, 62], [-95, 68], [-125, 70],
    [-141, 70], [-156, 71], [-168, 66],
  ],
  // South America
  [
    [-81, 0], [-80, -6], [-76, -14], [-71, -18], [-71, -30], [-73, -42],
    [-75, -50], [-68, -55], [-65, -47], [-62, -39], [-57, -35], [-53, -33],
    [-48, -26], [-40, -21], [-35, -9], [-44, -2], [-50, 0], [-52, 5], [-60, 8],
    [-70, 11], [-77, 8], [-79, 2], [-81, 0],
  ],
  // Australia
  [
    [113, -22], [114, -27], [118, -34], [126, -32], [134, -32], [138, -35],
    [147, -38], [150, -37], [153, -28], [146, -19], [142, -11], [136, -12],
    [130, -12], [126, -14], [122, -17], [113, -22],
  ],
  // Greenland
  [[-45, 60], [-52, 68], [-55, 76], [-40, 83], [-22, 80], [-20, 70], [-32, 64], [-45, 60]],
  // Japan
  [[130, 32], [136, 35], [141, 40], [142, 45], [139, 36], [133, 33], [130, 32]],
  // New Zealand
  [[173, -35], [178, -38], [174, -41], [170, -46], [167, -45], [172, -40], [173, -35]],
  // Sri Lanka & Maldives
  [[80, 9], [82, 7], [80, 6], [79, 8], [80, 9]],
  [[73, 4], [74, 3], [73, 2], [72, 3], [73, 4]],
];

/** Draw Realistic Earth Texture with Deep Oceans and Rich Land Topography */
function drawAdvancedEarthTexture(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;

  // 1. Deep Ocean Bathymetry Gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, "#010d1c");
  oceanGrad.addColorStop(0.3, "#041b36");
  oceanGrad.addColorStop(0.5, "#062348");
  oceanGrad.addColorStop(0.7, "#041b36");
  oceanGrad.addColorStop(1, "#010d1c");
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. High-Tech Translucent Gold Graticule
  ctx.strokeStyle = "rgba(212, 175, 55, 0.12)";
  ctx.lineWidth = 1.2;
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * canvas.width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // 3. Realistic Continents with Terrain Shading
  for (const poly of LAND_POLYGONS) {
    ctx.beginPath();
    poly.forEach((pair, i) => {
      const lon = pair[0]!;
      const lat = pair[1]!;
      const x = ((lon + 180) / 360) * canvas.width;
      const y = ((90 - lat) / 180) * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    // Land base: Emerald/Forest & Desert Earth tones
    const landGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    landGrad.addColorStop(0, "#193522");
    landGrad.addColorStop(0.4, "#294d32");
    landGrad.addColorStop(0.7, "#423d24");
    landGrad.addColorStop(1, "#193522");
    ctx.fillStyle = landGrad;
    ctx.fill();

    // Golden glowing coastlines
    ctx.strokeStyle = "rgba(212, 175, 55, 0.75)";
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  return canvas;
}

function createRenderer(canvas: HTMLCanvasElement): THREE.WebGLRenderer | null {
  try {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    if (!renderer.getContext()) return null;
    return renderer;
  } catch {
    return null;
  }
}

type HoverState = { marker: GlobeMarker; x: number; y: number } | null;

const REGIONS = [
  { name: "All Destinations", icon: GlobeIcon, rotY: 0, rotX: 0.2 },
  { name: "Europe & Alps", icon: Compass, rotY: -0.6, rotX: 0.4 },
  { name: "Asia & Japan", icon: Sparkles, rotY: -1.8, rotX: 0.3 },
  { name: "Middle East & Umrah", icon: MapPin, rotY: -0.2, rotX: 0.2 },
  { name: "Tropical Islands", icon: Plane, rotY: -1.1, rotX: -0.05 },
];

export function DestinationGlobe({
  eyebrow = "3D Interactive Earth",
  heading = "Fly From Dubai to 40+ Global Destinations",
}: {
  eyebrow?: string;
  heading?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  const [supported, setSupported] = useState<boolean | null>(null);
  const [hover, setHover] = useState<HoverState>(null);
  const [flying, setFlying] = useState(false);
  const [activeRegion, setActiveRegion] = useState("All Destinations");

  // Globe control callbacks
  const rotateTargetRef = useRef<{ y: number; x: number } | null>(null);
  const zoomLevelRef = useRef(3.1);

  useEffect(() => {
    const host = hostRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!host || !stage || !canvas) return;

    if (prefersReducedMotion()) {
      setSupported(false);
      return;
    }

    const renderer = createRenderer(canvas);
    if (!renderer) {
      setSupported(false);
      return;
    }
    setSupported(true);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    const HOME_CAM = new THREE.Vector3(0, 0, 3.1);
    camera.position.copy(HOME_CAM);

    /* --- 3D World Globe Mesh ---------------------------------------- */
    const world = new THREE.Group();
    scene.add(world);

    const texture = new THREE.CanvasTexture(drawAdvancedEarthTexture());
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS, 96, 96),
      new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.85,
        metalness: 0.15,
      }),
    );
    world.add(sphere);

    // Glowing Atmospheric Aura Shell
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS * 1.06, 64, 64),
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { uColor: { value: new THREE.Color("#4aa8ff") } },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          varying vec3 vNormal;
          void main() {
            float rim = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
            gl_FragColor = vec4(uColor, clamp(rim, 0.0, 1.0) * 0.65);
          }
        `,
      }),
    );
    world.add(atmosphere);

    // Dynamic Starfield Point Cloud in Background
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 600;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 18;
      starPositions[i + 1] = (Math.random() - 0.5) * 18;
      starPositions[i + 2] = -5 - Math.random() * 8;
    }
    starsGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0xffe899,
      size: 0.035,
      transparent: true,
      opacity: 0.5,
    });
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    const key = new THREE.DirectionalLight(0xfff6e5, 2.4);
    key.position.set(4, 3, 5);
    scene.add(key);

    /* --- Markers & Glowing Pins ------------------------------------- */
    const markerGroup = new THREE.Group();
    world.add(markerGroup);

    const markerGeo = new THREE.SphereGeometry(0.018, 16, 16);
    const markerMat = new THREE.MeshStandardMaterial({
      color: "#ffc83b",
      emissive: "#ffb700",
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const markerHotMat = new THREE.MeshStandardMaterial({
      color: "#00f0ff",
      emissive: "#00bfff",
      emissiveIntensity: 1.0,
      roughness: 0.1,
    });

    const markerMeshes: THREE.Mesh[] = [];
    globeMarkers.forEach((marker) => {
      const mesh = new THREE.Mesh(markerGeo, markerMat);
      const [x, y, z] = latLonToVec3(marker.lat, marker.lon, RADIUS * MARKER_LIFT);
      mesh.position.set(x, y, z);
      mesh.userData["marker"] = marker;
      markerGroup.add(mesh);
      markerMeshes.push(mesh);
    });

    // Dubai Hub Anchor (Home)
    const [hx, hy, hz] = latLonToVec3(HOME.lat, HOME.lon, RADIUS * MARKER_LIFT);
    const homeMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 24, 24),
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        emissive: "#ffcc00",
        emissiveIntensity: 1.2,
      }),
    );
    homeMesh.position.set(hx, hy, hz);
    world.add(homeMesh);

    const homeHalo = new THREE.Mesh(
      new THREE.RingGeometry(0.038, 0.065, 32),
      new THREE.MeshBasicMaterial({
        color: "#ffd700",
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      }),
    );
    homeHalo.position.set(hx, hy, hz);
    homeHalo.lookAt(0, 0, 0);
    world.add(homeHalo);

    /* --- Animated Glowing Flight Paths from Dubai ------------------- */
    const homeVec = new THREE.Vector3(hx, hy, hz);
    const flightLines: THREE.Line[] = [];

    globeMarkers.forEach((marker) => {
      const [mx, my, mz] = latLonToVec3(marker.lat, marker.lon, RADIUS * MARKER_LIFT);
      const dest = new THREE.Vector3(mx, my, mz);
      const angle = homeVec.angleTo(dest);
      const mid = homeVec
        .clone()
        .add(dest)
        .multiplyScalar(0.5)
        .normalize()
        .multiplyScalar(RADIUS + angle * 0.36);

      const curve = new THREE.QuadraticBezierCurve3(homeVec, mid, dest);
      const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
      const line = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({
          color: "#ffc83b",
          transparent: true,
          opacity: 0.35,
        }),
      );
      world.add(line);
      flightLines.push(line);
    });

    /* --- Interaction Handlers --------------------------------------- */
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(-10, -10);

    let hovered: THREE.Mesh | null = null;
    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartRotX = 0;
    let dragStartRotY = 0;
    let movedWhileDown = false;

    let manualSpinY = 0;
    let manualSpinX = 0.2;
    let idleDrift = 0;
    let renderedSpinY = 0;
    let renderedSpinX = 0.2;

    let fly: {
      from: THREE.Vector3;
      to: THREE.Vector3;
      t: number;
      slug: string;
    } | null = null;

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (dragging) {
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) movedWhileDown = true;
        manualSpinY = dragStartRotY + dx * 0.007;
        manualSpinX = clamp(dragStartRotX + dy * 0.005, -0.6, 0.6);
        rotateTargetRef.current = null;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      movedWhileDown = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragStartRotY = manualSpinY;
      dragStartRotX = manualSpinX;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerUp = (e: PointerEvent) => {
      dragging = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}

      if (!movedWhileDown && hovered && !fly) {
        const marker = hovered.userData["marker"] as GlobeMarker;
        setFlying(true);
        setHover(null);
        fly = {
          from: camera.position.clone(),
          to: hovered.position.clone().normalize().multiplyScalar(1.42),
          t: 0,
          slug: marker.slug,
        };
      }
    };

    const onPointerLeave = () => {
      pointer.set(-10, -10);
      dragging = false;
      setHover(null);
    };

    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave);

    /* --- Resize & Visibility ---------------------------------------- */
    let visible = false;

    // Scroll-driven rotation. The globe was drag-only, so on a scrolling page
    // it read as a static picture until you happened to grab it. This maps the
    // section's travel through the viewport to just over a half-turn, so the
    // Earth turns as you scroll past and the routes sweep into view on their
    // own. Pointer drag still wins while the user is actually holding it.
    let scrollSpin = 0;
    const readScroll = () => {
      const r = host.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 as the section's top enters the bottom of the viewport, 1 once its
      // bottom has cleared the top.
      const p = clamp((vh - r.top) / (vh + r.height));
      scrollSpin = p * Math.PI * 1.2;
    };
    readScroll();
    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", readScroll);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(host);

    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.setLength(w < 640 ? 4.2 : zoomLevelRef.current);
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    resize();

    /* --- Animation Render Loop -------------------------------------- */
    let raf = 0;
    let last = performance.now();
    const scratch = new THREE.Vector3();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!visible) return;

      // Smooth target region rotation or idle drift
      if (rotateTargetRef.current) {
        manualSpinY = lerp(manualSpinY, rotateTargetRef.current.y, 0.06);
        manualSpinX = lerp(manualSpinX, rotateTargetRef.current.x, 0.06);
      } else if (!dragging && !fly) {
        // Scroll position sets the base heading; a slow idle drift on top keeps
        // it alive when the page is stationary.
        idleDrift += dt * 0.035;
        manualSpinY = scrollSpin + idleDrift;
      }

      renderedSpinY = damp(renderedSpinY, manualSpinY, 0.2, dt);
      renderedSpinX = damp(renderedSpinX, manualSpinX, 0.2, dt);
      world.rotation.y = renderedSpinY;
      world.rotation.x = renderedSpinX;

      // Dubai pulsating radar wave
      homeHalo.scale.setScalar(1 + Math.sin(now * 0.003) * 0.22);
      homeHalo.material.opacity = 0.5 + Math.cos(now * 0.003) * 0.35;

      // Raycast marker hover
      if (!fly) {
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(markerMeshes, false);
        const first = (hits[0]?.object as THREE.Mesh) ?? null;

        if (first !== hovered) {
          if (hovered) {
            hovered.material = markerMat;
            hovered.scale.setScalar(1);
          }
          hovered = first;
          if (hovered) {
            hovered.material = markerHotMat;
            hovered.scale.setScalar(2.1);
          }
          canvas.style.cursor = hovered ? "pointer" : "grab";
        }

        if (hovered) {
          const marker = hovered.userData["marker"] as GlobeMarker;
          hovered.getWorldPosition(scratch).project(camera);
          const rect = canvas.getBoundingClientRect();
          const x = ((scratch.x + 1) / 2) * rect.width;
          const y = ((-scratch.y + 1) / 2) * rect.height;
          setHover((prev) =>
            prev && prev.marker.slug === marker.slug && prev.x === x && prev.y === y
              ? prev
              : { marker, x, y },
          );
        } else {
          setHover((prev) => (prev === null ? prev : null));
        }
      }

      // Fly-to animation
      if (fly) {
        fly.t = clamp(fly.t + dt * 1.1);
        camera.position.lerpVectors(fly.from, fly.to, easeInOut(fly.t));
        camera.lookAt(0, 0, 0);
        if (fly.t >= 1) {
          const slug = fly.slug;
          fly = null;
          camera.position.copy(HOME_CAM);
          camera.lookAt(0, 0, 0);
          setFlying(false);
          navigate({ to: "/countries/$slug", params: { slug } });
        }
      }

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    /* --- Teardown --------------------------------------------------- */
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", readScroll);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);

      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh | THREE.Line | THREE.Points;
        if (!("geometry" in mesh) || !mesh.geometry) return;
        mesh.geometry.dispose();
        const mat = mesh.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
      texture.dispose();
      renderer.dispose();
    };
  }, [navigate]);

  const handleSelectRegion = (reg: (typeof REGIONS)[0]) => {
    setActiveRegion(reg.name);
    rotateTargetRef.current = { y: reg.rotY, x: reg.rotX };
  };

  return (
    // The host is now just the interactive stage. The page section that embeds
    // this component owns the eyebrow and heading, so rendering them again here
    // produced two stacked titles — and the old full-bleed dark `<section>`
    // wrapper fought the light page it now sits inside.
    <section ref={hostRef} className="relative overflow-hidden" aria-label={heading}>
      <div className="relative z-20 px-4 pt-5 sm:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-400/40 bg-white/10 px-3.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-sm">
            <Sparkles className="size-3.5 text-amber-400" />
            <span>Drag to spin · click a pin for packages</span>
          </div>

          {/* Region Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {REGIONS.map((reg) => {
              const Icon = reg.icon;
              return (
                <button
                  key={reg.name}
                  type="button"
                  onClick={() => handleSelectRegion(reg)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all",
                    activeRegion === reg.name
                      ? "bg-[#CAA42D] text-[#00172e] shadow-lg scale-105"
                      : "border border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{reg.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3D Canvas Stage */}
      <div
        ref={stageRef}
        className="relative mt-4 h-[560px] w-full overflow-hidden bg-gradient-to-b from-[#00172e] via-[#000f1f] to-[#00172e]"
      >
        <canvas
          ref={canvasRef}
          className="size-full touch-pan-y"
          style={{ cursor: "grab" }}
          aria-hidden
        />

        {/* Hover Tooltip Popup Card */}
        {hover && !flying && (
          <div
            className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-[calc(100%+16px)] rounded-2xl border border-amber-400/50 bg-[#00172e]/95 p-4 text-white shadow-2xl backdrop-blur-md min-w-[200px]"
            style={{ left: hover.x, top: hover.y }}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-sm font-bold text-amber-300">
                {hover.marker.name}
              </p>
              <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 uppercase">
                {hover.marker.region}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              {hover.marker.tagline || `Direct packages from Dubai`}
            </p>
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="font-extrabold text-amber-400">
                {hover.marker.fromAed ? `from AED ${hover.marker.fromAed.toLocaleString()}` : "Inquire Fares"}
              </span>
              <span className="text-[10px] text-white/80 font-bold">
                Tap to Explore →
              </span>
            </div>
          </div>
        )}

        {/* Flying Transition Indicator */}
        {flying && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-xs">
            <div className="rounded-2xl border border-amber-400 bg-[#00172e] px-6 py-3 text-center shadow-2xl">
              <Plane className="mx-auto size-6 text-amber-400 animate-bounce" />
              <p className="mt-2 font-display text-sm font-bold text-white uppercase tracking-wider">
                Flying to Destination...
              </p>
            </div>
          </div>
        )}

        {/* Dubai Origin Pill Floating Badge */}
        <div className="absolute bottom-5 left-5 z-20 flex items-center gap-2 rounded-xl border border-white/15 bg-[#00365F]/80 px-4 py-2 text-xs text-white backdrop-blur-md">
          <span className="size-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-bold text-amber-300">Hub: Dubai, UAE</span>
          <span className="text-white/60">· IATA Flight Routes Active</span>
        </div>
      </div>
    </section>
  );
}
