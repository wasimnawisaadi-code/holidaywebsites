import React, { useEffect, useRef } from "react";

type ParticleFieldProps = {
  className?: string;
  particleCount?: number;
  interactive?: boolean;
};

export function GoldParticleField({
  className = "absolute inset-0 pointer-events-none",
  particleCount = 55,
  interactive = true,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      opacitySpeed: number;
      color: string;
    }> = [];

    const goldShades = ["#d4af37", "#f59e0b", "#fbbf24", "#fef3c7", "#e2e8f0"];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.2 + 0.6,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: -(Math.random() * 0.45 + 0.1),
        opacity: Math.random() * 0.7 + 0.2,
        opacitySpeed: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        color: goldShades[Math.floor(Math.random() * goldShades.length)],
      });
    }

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleResize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    let animId = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.speedX;
        p.y += p.speedY;

        // Twinkle
        p.opacity += p.opacitySpeed;
        if (p.opacity > 0.85 || p.opacity < 0.15) {
          p.opacitySpeed = -p.opacitySpeed;
        }

        // Wrap around
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        // Gentle mouse interaction
        if (interactive && mouseX > 0 && mouseY > 0) {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const force = (120 - dist) / 120;
            p.x += (dx / dist) * force * 1.5;
            p.y += (dy / dist) * force * 1.5;
          }
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = p.size * 3;
        ctx.shadowColor = p.color;
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [particleCount, interactive]);

  return <canvas ref={canvasRef} className={className} />;
}
