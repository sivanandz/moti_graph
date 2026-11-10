import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  Img,
} from "remotion";
import { ThreeCanvasWrapper } from "../components/ThreeCanvasWrapper";
import { MarkerHighlight } from "../components/MarkerHighlight";
import { DymoLabel } from "../components/DymoLabel";
import { PushPin } from "../components/PushPin";
import { ScotchTape } from "../components/ScotchTape";
import { FilmStripOverlay } from "../components/FilmStripOverlay";

const ThreeBankingNodes: React.FC<{ progress: number }> = ({ progress }) => {
  const packetX = interpolate(progress, [0, 1], [-2.4, 2.4]);
  const bounceY = Math.sin(progress * Math.PI) * 0.4;

  return (
    <group position={[0, -0.2, 0]}>
      {/* Sender Bank Node */}
      <mesh position={[-2.4, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.25, 32]} />
        <meshStandardMaterial color="#1D3557" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Central NPCI Hub Node */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.35, 32]} />
        <meshStandardMaterial color="#D62828" roughness={0.15} metalness={0.3} />
      </mesh>

      {/* Receiver Merchant Bank Node */}
      <mesh position={[2.4, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.25, 32]} />
        <meshStandardMaterial color="#2B9348" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Dynamic Data Routing Line */}
      <mesh position={[0, 0.2, -0.1]}>
        <boxGeometry args={[4.8, 0.04, 0.04]} />
        <meshBasicMaterial color="#A09E96" />
      </mesh>

      {/* Pulsing 400ms Gold Data Packet */}
      <mesh position={[packetX, 0.2 + bounceY, 0.25]}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshBasicMaterial color="#FFEA00" />
      </mesh>
    </group>
  );
};

export const Beat03_NpciSwitch: React.FC<{
  title: string;
  highlight: string;
  tag: string;
}> = ({ title, highlight, tag }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.5, stiffness: 140 },
  });

  const packetProgress = interpolate(
    frame % 45,
    [0, 40],
    [0, 1],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#EAE5DA", overflow: "hidden" }}>
      {/* Archival Bank Vault Door Image Background (Subtle Texture Blend) */}
      <Img
        src={staticFile("images/bank_vault_doors.jpg")}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.18,
          filter: "grayscale(1) contrast(1.4)",
          mixBlendMode: "multiply",
        }}
      />

      {/* 3D Banking Switchboard */}
      <ThreeCanvasWrapper cameraPosition={[0, 0.9, 4.6]}>
        <ThreeBankingNodes progress={packetProgress} />
      </ThreeCanvasWrapper>

      {/* Overlay Typography & Paper Header */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px 100px 80px",
          transform: `translateY(${interpolate(entrance, [0, 1], [60, 0])}px)`,
        }}
      >
        {/* Top Header Card */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            padding: "24px 36px",
            border: "1px solid #D5D0C5",
            boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
            maxWidth: "1050px",
            position: "relative",
          }}
        >
          <ScotchTape top="-14px" left="40px" rotation={-4} />
          <ScotchTape top="-14px" right="40px" rotation={5} />
          <PushPin top="-10px" left="50%" color="brass" />

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <DymoLabel text="SYSTEM SPECIFICATION" size="sm" bgColor="#D62828" />
            <span style={{ fontFamily: "Courier New, monospace", fontSize: "14px", color: "#666" }}>
              {tag}
            </span>
          </div>

          <h2
            style={{
              fontFamily: "Impact, Franklin Gothic Bold, sans-serif",
              fontSize: "58px",
              lineHeight: 1.1,
              color: "#111111",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            {title}{" "}
            <MarkerHighlight startFrame={15} durationFrames={14} color="#00F5D4">
              {highlight}
            </MarkerHighlight>
          </h2>
        </div>

        {/* Node Labels Legend (Dymo Label Badges) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            maxWidth: "1050px",
            margin: "0 auto",
            width: "100%",
            zIndex: 25,
          }}
        >
          <DymoLabel text="[ SENDER BANK ]" size="md" bgColor="#1D3557" rotation={-2} />
          <DymoLabel text="[ NPCI 400MS SWITCH ]" size="md" bgColor="#D62828" rotation={1} />
          <DymoLabel text="[ MERCHANT BANK ]" size="md" bgColor="#2B9348" rotation={-1} />
        </div>
      </AbsoluteFill>

      {/* 35mm Film Strip Footer */}
      <FilmStripOverlay timecode="00:00:22:25" label="STAGE 03 // REAL-TIME NETWORK SWITCH" />
    </AbsoluteFill>
  );
};
