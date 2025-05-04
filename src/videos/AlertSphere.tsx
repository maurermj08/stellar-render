import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

interface AlertSphereProps {
  sphereColor?: string;
  backgroundColor?: string;
  redLabelColor?: string;
  greenLabelColor?: string;
  rotationSpeed?: number;
  sphereSizeRatio?: number;
  tiltAngle?: number;
  hideBackface?: boolean;
  seed?: number;
  greenMessages: string[];
  redMessages: string[];
  useAurekBesh: boolean;
}

export const AlertSphere: React.FC<AlertSphereProps> = ({
  sphereColor = '#00FF00',
  backgroundColor = '#000000',
  redLabelColor = '#FF0000',
  greenLabelColor = '#00FF00',
  rotationSpeed = 2,
  sphereSizeRatio = 4,
  tiltAngle = 32.5,
  hideBackface = false,
  seed = 0,
  greenMessages,
  redMessages,
  useAurekBesh,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const sphereCanvasRef = useRef<HTMLCanvasElement>(null);
  const terminalCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const SEGMENTS = 32;
  const RINGS = 18;
  const LABEL_DURATION = 6000;
  const LABEL_GROWTH_RATE = 500;
  const LABEL_MAX_LINE_LENGTH_RATIO = 0.3;
  const LABEL_CREATION_INTERVAL_MIN = 1000;
  const LABEL_CREATION_INTERVAL_MAX = 5000;
  const RED_LABEL_CHANCE = 0.1;
  const MAX_TERMINAL_MESSAGES = 16;
  const TERMINAL_LINE_HEIGHT = 24;
  const TERMINAL_PADDING = 10;
  const TERMINAL_MESSAGE_DURATION = 60000;

  const TILT_ANGLE = tiltAngle * Math.PI / 180;

  // Pre-generate all random elements
  const preGeneratedData = useMemo(() => {
    const seededRandom = () => {
      let state = seed;
      return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
      };
    };

    const random = seededRandom();
    const labels = [];
    const messages = [];
    let currentFrame = 0;

    while (currentFrame < durationInFrames) {
      if (labels.length === 0 || (currentFrame % Math.floor(fps * (LABEL_CREATION_INTERVAL_MIN / 1000)) === 0 && random() < 0.5)) {
        const theta = random() * 2 * Math.PI;
        const phi = random() * Math.PI;
        const number = Math.floor(random() * 1000);
        const color = random() < RED_LABEL_CHANCE ? redLabelColor : greenLabelColor;
        
        const label = {
          theta,
          phi,
          number,
          color,
          createdAt: currentFrame,
          maxLineLength: 0 // We'll calculate this in the render loop
        };
        
        labels.push(label);
        
        const isRed = color === redLabelColor;
        const messagePool = isRed ? redMessages : greenMessages;
        const messageText = `${number}: ${messagePool[Math.floor(random() * messagePool.length)]}`;
        
        messages.push({
          text: messageText,
          color,
          createdAt: currentFrame
        });
      }
      currentFrame++;
    }

    return { labels, messages };
  }, [seed, durationInFrames, fps, redLabelColor, greenLabelColor, redMessages, greenMessages]);

  // Calculate rotation angle based on frame, now using 1/4 of the rotationSpeed prop
  const rotationAngle = useMemo(() => {
    return (frame * (rotationSpeed / 4)) / fps;
  }, [frame, rotationSpeed, fps]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        setDimensions({ width: containerWidth, height: containerHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const fontFamily = useAurekBesh ? 'AurekBesh' : 'HandelGotDMed';
  const fontSize = useAurekBesh ? 19 : 36; // Increased font size when not using Aurebesh

  useEffect(() => {
    const sphereCanvas = sphereCanvasRef.current;
    const terminalCanvas = terminalCanvasRef.current;
    if (!sphereCanvas || !terminalCanvas) return;

    const sphereCtx = sphereCanvas.getContext('2d');
    const terminalCtx = terminalCanvas.getContext('2d');
    if (!sphereCtx || !terminalCtx) return;

    const centerX = dimensions.width * 0.25;
    const centerY = dimensions.height * 0.5;
    const radius = Math.min(dimensions.width, dimensions.height) * (sphereSizeRatio / 10);

    function rotatePoint(x: number, y: number, z: number) {
      let x1 = x * Math.cos(rotationAngle) - z * Math.sin(rotationAngle);
      let z1 = x * Math.sin(rotationAngle) + z * Math.cos(rotationAngle);
      let y2 = y * Math.cos(TILT_ANGLE) - z1 * Math.sin(TILT_ANGLE);
      let z2 = y * Math.sin(TILT_ANGLE) + z1 * Math.cos(TILT_ANGLE);
      return { x: x1, y: y2, z: z2 };
    }

    function drawSphere() {
      sphereCtx.clearRect(0, 0, dimensions.width, dimensions.height);
      sphereCtx.strokeStyle = sphereColor;
      sphereCtx.fillStyle = backgroundColor;
      sphereCtx.lineWidth = 1;

      for (let i = 0; i <= SEGMENTS; i++) {
        for (let j = 0; j <= RINGS; j++) {
          const theta1 = (i / SEGMENTS) * 2 * Math.PI;
          const theta2 = ((i + 1) / SEGMENTS) * 2 * Math.PI;
          const phi1 = (j / RINGS) * Math.PI;
          const phi2 = ((j + 1) / RINGS) * Math.PI;

          const point1 = rotatePoint(
            radius * Math.sin(phi1) * Math.cos(theta1),
            radius * Math.cos(phi1),
            radius * Math.sin(phi1) * Math.sin(theta1)
          );
          const point2 = rotatePoint(
            radius * Math.sin(phi1) * Math.cos(theta2),
            radius * Math.cos(phi1),
            radius * Math.sin(phi1) * Math.sin(theta2)
          );
          const point3 = rotatePoint(
            radius * Math.sin(phi2) * Math.cos(theta2),
            radius * Math.cos(phi2),
            radius * Math.sin(phi2) * Math.sin(theta2)
          );
          const point4 = rotatePoint(
            radius * Math.sin(phi2) * Math.cos(theta1),
            radius * Math.cos(phi2),
            radius * Math.sin(phi2) * Math.sin(theta1)
          );

          const nx = (point1.x + point2.x + point3.x + point4.x) / 4;
          const ny = (point1.y + point2.y + point3.y + point4.y) / 4;
          const nz = (point1.z + point2.z + point3.z + point4.z) / 4;

          if (!hideBackface || nx * (centerX - dimensions.width/2) + ny * (centerY - dimensions.height/2) + nz * radius < 0) {
            sphereCtx.beginPath();
            sphereCtx.moveTo(point1.x + centerX, point1.y + centerY);
            sphereCtx.lineTo(point2.x + centerX, point2.y + centerY);
            sphereCtx.lineTo(point3.x + centerX, point3.y + centerY);
            sphereCtx.lineTo(point4.x + centerX, point4.y + centerY);
            sphereCtx.closePath();
            sphereCtx.stroke();
          }
        }
      }
    }

    function drawLabels() {
      sphereCtx.lineWidth = 2;

      const visibleLabels = preGeneratedData.labels.filter(label => 
        frame >= label.createdAt && frame - label.createdAt <= LABEL_DURATION / (1000 / fps)
      );

      for (const label of visibleLabels) {
        sphereCtx.strokeStyle = label.color;
        sphereCtx.fillStyle = label.color;
        sphereCtx.font = `bold ${fontSize}px ${fontFamily}`;

        const x = radius * Math.sin(label.phi) * Math.cos(label.theta);
        const y = radius * Math.cos(label.phi);
        const z = radius * Math.sin(label.phi) * Math.sin(label.theta);

        const rotated = rotatePoint(x, y, z);
        const projectedX = rotated.x + centerX;
        const projectedY = rotated.y + centerY;

        // Calculate maxLineLength here based on current dimensions
        label.maxLineLength = Math.min(dimensions.width, dimensions.height) * (sphereSizeRatio / 10) * LABEL_MAX_LINE_LENGTH_RATIO;
        const lineLength = Math.min(label.maxLineLength, (frame - label.createdAt) * label.maxLineLength / LABEL_GROWTH_RATE);
        const endX = projectedX + lineLength * (rotated.x / radius);
        const endY = projectedY + lineLength * (rotated.y / radius);

        sphereCtx.beginPath();
        sphereCtx.moveTo(projectedX, projectedY);
        sphereCtx.lineTo(endX, endY);
        sphereCtx.stroke();

        sphereCtx.fillText(label.number.toString(), endX + 5, endY + 5);
      }
    }

    function drawTerminal() {
      terminalCtx.fillStyle = backgroundColor;
      terminalCtx.fillRect(0, 0, dimensions.width * 0.5, dimensions.height);
      terminalCtx.font = `${fontSize}px ${fontFamily}`;

      const visibleMessages = preGeneratedData.messages.filter(message => 
        frame >= message.createdAt && frame - message.createdAt <= TERMINAL_MESSAGE_DURATION / (1000 / fps)
      ).slice(-MAX_TERMINAL_MESSAGES);

      let y = dimensions.height - TERMINAL_PADDING;

      for (let i = visibleMessages.length - 1; i >= 0; i--) {
        const message = visibleMessages[i];
        const age = frame - message.createdAt;
        const alpha = Math.max(0, 1 - age / (TERMINAL_MESSAGE_DURATION / (1000 / fps)));

        terminalCtx.fillStyle = message.color;
        terminalCtx.globalAlpha = alpha;
        terminalCtx.fillText(message.text, TERMINAL_PADDING, y);
        y -= TERMINAL_LINE_HEIGHT * 3;

        if (y < TERMINAL_PADDING) break;
      }

      terminalCtx.globalAlpha = 1;
    }

    // Draw everything
    drawSphere();
    drawLabels();
    drawTerminal();

  }, [frame, dimensions, sphereColor, backgroundColor, redLabelColor, greenLabelColor, rotationSpeed, sphereSizeRatio, TILT_ANGLE, preGeneratedData, rotationAngle, fps, hideBackface, useAurekBesh, fontFamily, fontSize]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full flex"
      style={{ backgroundColor }}
    >
      <canvas
        ref={sphereCanvasRef}
        width={dimensions.width * 0.5}
        height={dimensions.height}
        className="w-1/2 h-full border-r border-gray-700"
      />
      <canvas
        ref={terminalCanvasRef}
        width={dimensions.width * 0.5}
        height={dimensions.height}
        className="w-1/2 h-full"
      />
    </div>
  );
};
