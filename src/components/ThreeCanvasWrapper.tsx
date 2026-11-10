import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useVideoConfig } from "remotion";

export const ThreeCanvasWrapper: React.FC<{
  children: React.ReactNode;
  cameraPosition?: [number, number, number];
  fov?: number;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}> = ({
  children,
  cameraPosition = [0, 1.2, 5],
  fov = 45,
  width: customWidth,
  height: customHeight,
  style: customStyle,
}) => {
  const { width: defaultWidth, height: defaultHeight } = useVideoConfig();
  const w = customWidth || defaultWidth;
  const h = customHeight || defaultHeight;

  return (
    <ThreeCanvas
      width={w}
      height={h}
      camera={{ position: cameraPosition, fov }}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        ...customStyle,
      }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 8, 6]} intensity={1.3} />
      <directionalLight position={[-4, 3, -2]} intensity={0.4} color="#87DAEE" />
      {children}
    </ThreeCanvas>
  );
};
