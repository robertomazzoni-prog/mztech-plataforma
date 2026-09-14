"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { PulsingBorder } from "@paper-design/shaders-react";

export interface PulsatingBorderProps {
  colors?: string[];
  colorBack?: string;
  speed?: number;
  radius?: number;
  thickness?: number;
  softness?: number;
  intensity?: number;
  bloom?: number;
  spotSize?: number;
  spread?: number;
  usePortal?: boolean;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
}

const DEFAULT_COLORS = ["#2563eb", "#06b6d4", "#6366f1"];

const DEFAULTS = {
  colorBack: "rgba(0, 0, 0, 0)",
  speed: 1,
  radius: 12,
  thickness: 3.5,
  softness: 60,
  intensity: 35,
  bloom: 45,
  spotSize: 55,
  spread: 0,
};

const SPOTS = 3;
const PULSE = 0;
const SMOKE = 0.35;
const SMOKE_SIZE = 0.63;

const GLOW_ROOM = 0.3;
const MAX_ROOM = 360;

// Safe Error Boundary to prevent WebGL runtime failures from crashing the UI
class SafeShaderMount extends React.Component<
  { fallback: React.ReactNode; onError?: () => void; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("SafeShaderMount: WebGL shader error caught, falling back to CSS", error);
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function PulsatingBorder(props: PulsatingBorderProps) {
  const {
    colorBack = DEFAULTS.colorBack,
    speed = DEFAULTS.speed,
    radius = DEFAULTS.radius,
    thickness = DEFAULTS.thickness,
    softness = DEFAULTS.softness,
    intensity = DEFAULTS.intensity,
    bloom = DEFAULTS.bloom,
    spotSize = DEFAULTS.spotSize,
    spread = DEFAULTS.spread,
    usePortal = false,
    style,
    className,
    children,
  } = props;

  const colors =
    Array.isArray(props.colors) && props.colors.length
      ? props.colors
      : DEFAULT_COLORS;

  const hostRef = React.useRef<HTMLDivElement>(null);

  const [rect, setRect] = React.useState({ left: 0, top: 0, w: 0, h: 0 });
  const [portalTarget, setPortalTarget] = React.useState<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  const [hasWebGlError, setHasWebGlError] = React.useState<boolean>(false);
  const [isMounted, setIsMounted] = React.useState<boolean>(false);

  React.useEffect(() => {
    setIsMounted(true);
    // Detect mobile / touch devices or screens with strict WebGL context limits
    const checkMobile = () => {
      const isTouch =
        typeof window !== "undefined" &&
        ("ontouchstart" in window ||
          (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) ||
          window.innerWidth <= 768);
      setIsMobile(Boolean(isTouch));
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Test WebGL2 support
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl2");
      if (!gl) {
        setHasWebGlError(true);
      }
    } catch {
      setHasWebGlError(true);
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Listen for context lost on the container to gracefully downgrade to CSS
  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setHasWebGlError(true);
    };

    host.addEventListener("webglcontextlost", handleContextLost, true);
    return () => {
      host.removeEventListener("webglcontextlost", handleContextLost, true);
    };
  }, []);

  React.useEffect(() => {
    if (usePortal) {
      setPortalTarget(document.body);
    }
  }, [usePortal]);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const r = host.getBoundingClientRect();
      const w = host.clientWidth || r.width;
      const h = host.clientHeight || r.height;
      setRect((prev) =>
        prev.left === r.left &&
        prev.top === r.top &&
        prev.w === w &&
        prev.h === h
          ? prev
          : { left: r.left, top: r.top, w, h }
      );
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    const ro = new ResizeObserver(schedule);
    ro.observe(host);

    if (usePortal) {
      window.addEventListener("scroll", schedule, true);
    }
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      if (usePortal) {
        window.removeEventListener("scroll", schedule, true);
      }
      window.removeEventListener("resize", schedule);
    };
  }, [usePortal]);

  const worldW = rect.w + spread * 2;
  const worldH = rect.h + spread * 2;
  const marginX = worldW > 0 ? spread / worldW : 0;
  const marginY = worldH > 0 ? spread / worldH : 0;

  const room = Math.min(
    MAX_ROOM,
    Math.ceil(GLOW_ROOM * Math.min(worldW, worldH))
  );
  const bleed = spread + room;
  const canvasW = rect.w + bleed * 2;
  const canvasH = rect.h + bleed * 2;
  const measured = rect.w > 0 && rect.h > 0;

  const escapes = usePortal && portalTarget !== null;

  const maxR = Math.min(rect.w, rect.h) / 2;
  const effectiveRoundness =
    maxR > 0
      ? radius > 1
        ? Math.min(1, Math.max(0, radius / maxR))
        : Math.min(1, Math.max(0, radius))
      : radius > 1
      ? radius / 24
      : radius;

  // High-performance CSS Fallback (active on mobile, touch, or when WebGL context fails)
  const renderCssBorder = () => {
    const colorString = colors.join(", ");
    const spinDuration = Math.max(1.8, 3.5 / (speed || 1));
    const effectiveRadius = radius ?? DEFAULTS.radius;
    const effectiveThickness = thickness ?? DEFAULTS.thickness;

    return (
      <div
        className="pulsating-border-css-layer pointer-events-none"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: `${effectiveRadius}px`,
          zIndex: 1,
          overflow: "visible",
        }}
        aria-hidden="true"
      >
        {/* Soft Ambient Glow (Bloom) */}
        <div
          style={{
            position: "absolute",
            inset: `-${effectiveThickness + 2}px`,
            borderRadius: `${effectiveRadius + effectiveThickness + 2}px`,
            overflow: "hidden",
            filter: `blur(${Math.max(6, Math.round((bloom / 100) * 16))}px)`,
            opacity: Math.min(0.9, Math.max(0.4, (intensity / 100) * 1.5)),
            zIndex: 1,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-100%",
              left: "-100%",
              width: "300%",
              height: "300%",
              background: `conic-gradient(from 0deg, ${colorString}, ${colors[0]})`,
              animation: `pulsating-spin ${spinDuration}s linear infinite`,
            }}
          />
        </div>

        {/* Crisp Border Frame */}
        <div
          style={{
            position: "absolute",
            inset: `-${effectiveThickness}px`,
            borderRadius: `${effectiveRadius + effectiveThickness}px`,
            padding: `${effectiveThickness}px`,
            overflow: "hidden",
            zIndex: 2,
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-100%",
              left: "-100%",
              width: "300%",
              height: "300%",
              background: `conic-gradient(from 0deg, ${colorString}, ${colors[0]})`,
              animation: `pulsating-spin ${spinDuration}s linear infinite`,
            }}
          />
        </div>
      </div>
    );
  };

  const useWebGl = isMounted && !isMobile && !hasWebGlError;

  const webGlLayer = measured && useWebGl ? (
    <SafeShaderMount fallback={renderCssBorder()} onError={() => setHasWebGlError(true)}>
      <PulsingBorder
        colors={colors}
        colorBack={colorBack}
        speed={speed}
        roundness={effectiveRoundness}
        thickness={thickness / 100}
        softness={softness / 100}
        intensity={intensity / 100}
        bloom={bloom / 100}
        spots={SPOTS}
        spotSize={(spotSize / 100) * 0.5}
        pulse={PULSE}
        smoke={SMOKE}
        smokeSize={SMOKE_SIZE}
        worldWidth={worldW}
        worldHeight={worldH}
        fit="none"
        marginLeft={marginX}
        marginRight={marginX}
        marginTop={marginY}
        marginBottom={marginY}
        scale={1}
        rotation={0}
        offsetX={0}
        offsetY={0}
        originX={0.5}
        originY={0.5}
        frame={0}
        style={{
          position: escapes ? "fixed" : "absolute",
          left: escapes ? rect.left - bleed : -bleed,
          top: escapes ? rect.top - bleed : -bleed,
          width: canvasW,
          height: canvasH,
          pointerEvents: "none",
          zIndex: 10,
          background: "transparent",
        }}
      />
    </SafeShaderMount>
  ) : null;

  return (
    <div
      ref={hostRef}
      className={className}
      style={{
        position: "relative",
        display: children ? (className?.includes("w-full") ? "block" : "inline-block") : "block",
        width: children ? (className?.includes("w-full") ? "100%" : "fit-content") : "100%",
        height: children ? "auto" : "100%",
        flexShrink: 0,
        overflow: "visible",
        background: "transparent",
        ...style,
      }}
    >
      {useWebGl ? (escapes ? createPortal(webGlLayer, portalTarget) : webGlLayer) : renderCssBorder()}
      <div style={{ position: "relative", zIndex: 20, width: "100%", height: "100%" }}>
        {children}
      </div>
    </div>
  );
}

PulsatingBorder.displayName = "Pulsating Border";