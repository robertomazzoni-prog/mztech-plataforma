"use client";

import * as React from "react";

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
  speed: 1,
  radius: 12,
  thickness: 3.5,
  intensity: 35,
  bloom: 45,
};

export default function PulsatingBorder(props: PulsatingBorderProps) {
  const {
    speed = DEFAULTS.speed,
    radius = DEFAULTS.radius,
    thickness = DEFAULTS.thickness,
    intensity = DEFAULTS.intensity,
    bloom = DEFAULTS.bloom,
    style,
    className,
    children,
  } = props;

  const colors =
    Array.isArray(props.colors) && props.colors.length
      ? props.colors
      : DEFAULT_COLORS;

  const colorString = colors.join(", ");
  const spinDuration = Math.max(1.8, 3.5 / (speed || 1));
  const effectiveRadius = radius ?? DEFAULTS.radius;
  const effectiveThickness = thickness ?? DEFAULTS.thickness;

  return (
    <div
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
      {/* High-performance GPU-accelerated CSS animated border */}
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
            willChange: "transform",
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
            willChange: "transform",
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

      <div style={{ position: "relative", zIndex: 20, width: "100%", height: "100%" }}>
        {children}
      </div>
    </div>
  );
}

PulsatingBorder.displayName = "Pulsating Border";