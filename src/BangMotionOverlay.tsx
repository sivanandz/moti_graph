import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";

export interface BangMotionOverlayProps {
  /** Video file path relative to public/ or production_hub/ */
  src: string;
  /** Whether the video has VP9/ProRes alpha transparency */
  transparent?: boolean;
  /** Custom CSS styling */
  style?: React.CSSProperties;
  /** Opacity level (0.0 to 1.0) */
  opacity?: number;
  /** Blend mode (e.g. 'screen', 'multiply', 'normal') */
  blendMode?: React.CSSProperties["mixBlendMode"];
}

/**
 * BangMotionOverlay: Seamlessly composites pre-rendered Bang Motion footage,
 * kinetic typography, or explainer scenes into Remotion compositions.
 */
export const BangMotionOverlay: React.FC<BangMotionOverlayProps> = ({
  src,
  transparent = true,
  style = {},
  opacity = 1.0,
  blendMode = "normal",
}) => {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity,
        mixBlendMode: blendMode,
        ...style,
      }}
    >
      <OffthreadVideo
        src={staticFile(src)}
        transparent={transparent}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </AbsoluteFill>
  );
};
