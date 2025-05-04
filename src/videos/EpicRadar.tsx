import React, { useRef, useEffect, useMemo } from 'react';
import { useCurrentFrame } from 'remotion';

interface EpicRadarProps {
  backgroundColor?: string;
  radarColor?: string;
  radarSpeed?: number;
  terrainPointCount?: number;
  terrainMinDistance?: number;
  terrainMaxDistance?: number;
  terrainSeed?: number;
  terrainPointSize?: number;
  terrainDotColor?: string;
}

// Add this function at the top of the file, outside of the component
function seededRandom(seed: number) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Add this function at the top of the file, outside of the component
function parseColor(color: string): { r: number; g: number; b: number } {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const bigint = parseInt(hex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  }

  // Handle rgb and rgba colors
  if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g);
    if (match) {
      return {
        r: parseInt(match[0]),
        g: parseInt(match[1]),
        b: parseInt(match[2]),
      };
    }
  }

  // Handle named colors
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = color;
    const namedColor = ctx.fillStyle;
    if (namedColor.startsWith('#')) {
      return parseColor(namedColor); // Recursively parse the hex color
    }
  }

  // Default to red if parsing fails
  return { r: 255, g: 0, b: 0 };
}

export const EpicRadar: React.FC<EpicRadarProps> = ({
  backgroundColor = 'black',
  radarColor = 'rgb(255, 0, 0)',
  terrainDotColor = 'rgb(255, 0, 0)',
  radarSpeed = 20, 
  terrainPointCount = 50,
  terrainMinDistance = 10,
  terrainMaxDistance = 90,
  terrainSeed = 12345,
  terrainPointSize = 2, 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();

  // Use useMemo to extract RGB values from radarColor
  const radarRGB = useMemo(() => parseColor(radarColor), [radarColor]);

  const terrainPoints = useMemo(() => {
    const points: TerrainPoint[] = [];
    let currentSeed = terrainSeed; // Use the prop instead of a constant
    for (let i = 0; i < terrainPointCount; i++) {
      points.push({
        angle: seededRandom(currentSeed++) * Math.PI * 2,
        distance: seededRandom(currentSeed++) * (terrainMaxDistance - terrainMinDistance) + terrainMinDistance,
        opacity: 0, // Start with opacity 0
        lastScan: -1, // Set to -1 to indicate it hasn't been scanned yet
      });
    }
    return points;
  }, [terrainPointCount, terrainMinDistance, terrainMaxDistance, terrainSeed]); // Add terrainSeed to dependencies

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Convert radarSpeed from 0-100 to radians per frame
    const radarAngle = (frame * (radarSpeed / 100) * 0.1) % (Math.PI * 2);
    const traceHistory: number[] = [];

    function drawRadar() {
      ctx.clearRect(0, 0, width, height);

      const { r: radarR, g: radarG, b: radarB } = radarRGB;

      // Draw range rings
      ctx.strokeStyle = `rgba(${radarR}, ${radarG}, ${radarB}, 0.3)`;
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * i / 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw radar circle
      ctx.strokeStyle = `rgb(${radarR}, ${radarG}, ${radarB})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw azimuth scale
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < 360; i += 5) {
        const angle = (i - 90) * Math.PI / 180;
        const isMajorTick = i % 30 === 0;
        const tickLength = isMajorTick ? 10 : 5;
        const labelDistance = radius - 25;
        
        const tickStart = radius - tickLength;
        const tickEnd = radius;
        const x = centerX + labelDistance * Math.cos(angle);
        const y = centerY + labelDistance * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(centerX + tickStart * Math.cos(angle), centerY + tickStart * Math.sin(angle));
        ctx.lineTo(centerX + tickEnd * Math.cos(angle), centerY + tickEnd * Math.sin(angle));
        ctx.strokeStyle = `rgba(${radarR}, ${radarG}, ${radarB}, 0.7)`;
        ctx.stroke();
        
        if (isMajorTick) {
          ctx.fillStyle = `rgb(${radarR}, ${radarG}, ${radarB})`;
          ctx.fillText(i.toString(), x, y);
        }
      }

      // Draw radar cross section
      ctx.strokeStyle = `rgba(${radarR}, ${radarG}, ${radarB}, 0.5)`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        const angle = (Math.PI / 2) * i;
        const innerRadius = radius * 0.15;
        const outerRadius = radius * 0.85;
        ctx.moveTo(
          centerX + Math.cos(angle) * innerRadius,
          centerY + Math.sin(angle) * innerRadius
        );
        ctx.lineTo(
          centerX + Math.cos(angle) * outerRadius,
          centerY + Math.sin(angle) * outerRadius
        );
        ctx.stroke();
      }

      // Draw ghosting effect
      ctx.lineWidth = 2;
      traceHistory.forEach((trace, index) => {
        const alpha = (index + 1) / traceHistory.length;
        ctx.strokeStyle = `rgba(${radarR}, ${radarG}, ${radarB}, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(trace) * radius,
          centerY + Math.sin(trace) * radius
        );
        ctx.stroke();
      });

      // Draw current sweeping line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(radarAngle) * radius,
        centerY + Math.sin(radarAngle) * radius
      );
      ctx.strokeStyle = `rgba(${radarR}, ${radarG}, ${radarB}, 0.8)`;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Extract RGB values from terrainDotColor
      const terrainRGB = terrainDotColor.match(/\d+/g);
      const terrainR = terrainRGB ? parseInt(terrainRGB[0]) : 255;
      const terrainG = terrainRGB ? parseInt(terrainRGB[1]) : 0;
      const terrainB = terrainRGB ? parseInt(terrainRGB[2]) : 0;

      // Draw terrain
      terrainPoints.forEach(point => {
        const scaledDistance = point.distance / 100;
        const x = centerX + Math.cos(point.angle) * (radius * scaledDistance);
        const y = centerY + Math.sin(point.angle) * (radius * scaledDistance);
        
        // Calculate angular distance from radar line
        let angularDistance = (radarAngle - point.angle + Math.PI * 2) % (Math.PI * 2);
        
        // Convert to degrees and normalize to 0-270 range
        const opacityFactor = Math.min(angularDistance * (180 / Math.PI), 270) / 270;
        
        // Calculate opacity (1 at 0 degrees, 0 at 270 degrees)
        const opacity = 1 - opacityFactor;
        
        if (opacity > 0) {
          ctx.fillStyle = `rgba(${terrainR}, ${terrainG}, ${terrainB}, ${opacity})`;
          ctx.beginPath();
          ctx.arc(x, y, terrainPointSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    function updateRadar() {
      traceHistory.push(radarAngle);
      if (traceHistory.length > 20) {
        traceHistory.shift();
      }
    }

    updateRadar();
    drawRadar();
  }, [frame, backgroundColor, radarColor, radarSpeed, terrainPoints, terrainPointSize, terrainDotColor, radarRGB]);

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor }}>
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        className="max-w-full max-h-full"
      />
    </div>
  );
};
