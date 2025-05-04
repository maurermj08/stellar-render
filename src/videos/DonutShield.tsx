import React, { useRef, useEffect, useState } from 'react';
import { useCurrentFrame } from 'remotion';

const ASPECT_RATIO = 16 / 9;

const SHIELD_MESSAGES = [
  "Quantum flux stabilizers online",
  "Tachyon particle harmonics nominal",
  "Subspace field integrity at 98.7%",
  "Neutrino dampeners functioning optimally"
];

interface DonutShieldProps {
  donutRotationSpeed?: number;
  message1?: string;
  message2?: string;
  message3?: string;
  message4?: string;
  donutColor?: string;
  innerCircleColor?: string;
  middleCircleColor?: string;
  outerCircleColor?: string;
  textColor?: string;
}

export const DonutShield: React.FC<DonutShieldProps> = ({
  donutRotationSpeed = 10,
  message1 = "Quantum flux stabilizers online",
  message2 = "Tachyon particle harmonics nominal",
  message3 = "Subspace field integrity at 98.7%",
  message4 = "Neutrino dampeners functioning optimally",
  donutColor = '#0f0',
  innerCircleColor = 'hsl(180, 100%, 50%)',
  middleCircleColor = 'hsl(200, 100%, 50%)',
  outerCircleColor = 'hsl(220, 100%, 50%)',
  textColor = '#0f0',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frame = useCurrentFrame();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const SHIELD_MESSAGES = [message1, message2, message3, message4];

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        
        let width = containerWidth;
        let height = containerWidth / ASPECT_RATIO;

        if (height > containerHeight) {
          height = containerHeight;
          width = containerHeight * ASPECT_RATIO;
        }

        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const time = frame * 0.01;

    function drawDonutStation(centerX: number, centerY: number, torusRadius: number, tubeRadius: number, segments: number, tubeSegments: number) {
      ctx.strokeStyle = donutColor;
      ctx.lineWidth = 1;

      const rotationY = time * (donutRotationSpeed / 50); // Adjust rotation speed

      function project(x: number, y: number, z: number) {
        return {
          x: centerX + x * 1.3, 
          y: centerY + (y * 0.3 + z) * 1.3
        };
      }

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        for (let j = 0; j <= tubeSegments; j++) {
          const phi = (j / tubeSegments) * Math.PI * 2;

          const x = (torusRadius + tubeRadius * Math.cos(phi)) * Math.cos(theta + rotationY);
          const y = (torusRadius + tubeRadius * Math.cos(phi)) * Math.sin(theta + rotationY);
          const z = tubeRadius * Math.sin(phi);

          const projected = project(x, y, z);

          if (i > 0 && j > 0) {
            const prevTheta = ((i - 1) / segments) * Math.PI * 2;
            const prevPhi = ((j - 1) / tubeSegments) * Math.PI * 2;

            const prevX = (torusRadius + tubeRadius * Math.cos(prevPhi)) * Math.cos(prevTheta + rotationY);
            const prevY = (torusRadius + tubeRadius * Math.cos(prevPhi)) * Math.sin(prevTheta + rotationY);
            const prevZ = tubeRadius * Math.sin(prevPhi);

            const projectedPrev = project(prevX, prevY, prevZ);

            ctx.beginPath();
            ctx.moveTo(projected.x, projected.y);
            ctx.lineTo(projectedPrev.x, projectedPrev.y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + rotationY;
        const x1 = (torusRadius - tubeRadius) * Math.cos(angle);
        const y1 = (torusRadius - tubeRadius) * Math.sin(angle);
        const x2 = (torusRadius + tubeRadius) * Math.cos(angle);
        const y2 = (torusRadius + tubeRadius) * Math.sin(angle);

        const projected1 = project(x1, y1, 0);
        const projected2 = project(x2, y2, 0);

        ctx.beginPath();
        ctx.moveTo(projected1.x, projected1.y);
        ctx.lineTo(projected2.x, projected2.y);
        ctx.stroke();
      }
    }

    function drawShields(time: number) {
      const centerX = width / 2;
      const centerY = height / 2;

      const shieldColors = [innerCircleColor, middleCircleColor, outerCircleColor];

      for (let i = 0; i < 3; i++) {
        const radius = 385 + i * 52;
        const opacity = 0.3 + 0.2 * Math.sin(time * 0.5 + i * Math.PI / 3);
        
        // Parse the color to get hue, saturation, and lightness
        const color = parseColor(shieldColors[i]);
        const hue = color.h;
        const saturation = color.s;
        const lightness = color.l;

        ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        const gradient = ctx.createRadialGradient(centerX, centerY, radius - 5, centerX, centerY, radius + 5);
        gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, 0)`);
        gradient.addColorStop(0.5, `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity * 0.3})`);
        gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness}%, 0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Add this helper function to parse different color formats
    function parseColor(color: string): { h: number; s: number; l: number } {
      if (color.startsWith('#')) {
        // Convert hex to HSL
        const r = parseInt(color.slice(1, 3), 16) / 255;
        const g = parseInt(color.slice(3, 5), 16) / 255;
        const b = parseInt(color.slice(5, 7), 16) / 255;
        return rgbToHsl(r, g, b);
      } else if (color.startsWith('hsl')) {
        // Parse HSL values
        const [h, s, l] = color.match(/\d+/g)!.map(Number);
        return { h, s, l };
      } else {
        // Default to green if color format is not recognized
        return { h: 120, s: 100, l: 50 };
      }
    }

    function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h! /= 6;
      }

      return { h: Math.round(h! * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    }

    function drawTerminal(time: number) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#0f01';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      drawShields(time);
      drawDonutStation(width / 2, height / 2, 195, 65, 60, 20);

      ctx.fillStyle = textColor;
      ctx.font = '20px monospace';
      ctx.fillText('SHIELD STATUS: ACTIVE', 20, 30);
      ctx.fillText('STATION INTEGRITY: 100%', 20, 55);
      ctx.fillText('THREAT LEVEL: LOW', 20, 80);
      ctx.fillText('ROTATION: CLOCKWISE', 20, 105);

      const messageIndex = Math.floor(time / 2) % SHIELD_MESSAGES.length;
      const currentMessage = SHIELD_MESSAGES[messageIndex];
      const typedLength = Math.floor((time % 2) * currentMessage.length);
      const typedMessage = currentMessage.slice(0, typedLength);

      ctx.font = '30px monospace';
      ctx.fillText(typedMessage, 20, height - 30);

      if (typedLength < currentMessage.length) {
        ctx.fillText('_', 20 + ctx.measureText(typedMessage).width, height - 30);
      }
    }

    drawTerminal(time);
  }, [frame, dimensions, donutRotationSpeed, message1, message2, message3, message4, donutColor, innerCircleColor, middleCircleColor, outerCircleColor, textColor]);

  return (
    <div ref={containerRef} className="w-full h-full bg-black flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="max-w-full max-h-full"
      />
    </div>
  );
};
