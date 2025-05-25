import React, { useRef, useEffect } from 'react';
import { useCurrentFrame } from 'remotion';

interface ScifiGridProps {
  backgroundColor?: string;
  gridColor?: string;
  scanLineColor?: string;
  animationSpeed?: number;
  gridSpacing?: number;
  scanAngle?: number;
  scanLineThickness?: number;
  scanLineGlow?: number;
  numberOfLines?: number;
  gridLineThickness?: number;
}

// Helper function to convert any color format to rgba
const toRGBA = (color: string, alpha: number = 1) => {
  // Create a temporary div to use the browser's color parsing
  const div = document.createElement('div');
  div.style.color = color;
  document.body.appendChild(div);
  const computedColor = window.getComputedStyle(div).color;
  document.body.removeChild(div);

  // Parse the computed RGB values
  const match = computedColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (match) {
    const [_, r, g, b] = match;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color; // Fallback to original color if parsing fails
};

export const ScifiGrid: React.FC<ScifiGridProps> = ({
  backgroundColor = '#000000',
  gridColor = '#0066cc',
  scanLineColor = '#00ccff',
  animationSpeed = 1,
  gridSpacing = 50,
  scanAngle = 0,
  scanLineThickness = 4,
  scanLineGlow = 20,
  numberOfLines = 1,
  gridLineThickness = 2,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = gridLineThickness;

    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const angleRad = (scanAngle * Math.PI) / 180;
    const diagonalLength = Math.sqrt(width * width + height * height);
    const spacing = diagonalLength / numberOfLines;

    // Draw each scan line
    for (let lineIndex = 0; lineIndex < numberOfLines; lineIndex++) {
      const progress = ((frame * animationSpeed) + (lineIndex * spacing)) % diagonalLength;

      // Calculate start and end points of the scan line
      const cos = Math.cos(angleRad);
      const sin = Math.sin(angleRad);

      // Calculate perpendicular line through the progress point
      const centerX = width / 2;
      const centerY = height / 2;
      const progressOffset = progress - diagonalLength / 2;

      // Calculate the line's endpoints using parametric equations
      const lineLength = Math.max(width, height) * 2;
      const startX = centerX - lineLength * sin + progressOffset * cos;
      const startY = centerY + lineLength * cos + progressOffset * sin;
      const endX = centerX + lineLength * sin + progressOffset * cos;
      const endY = centerY - lineLength * cos + progressOffset * sin;

      // Draw multiple passes of the scan line for enhanced glow
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);

        // Draw the glow with increasing intensity
        ctx.shadowColor = scanLineColor;
        ctx.shadowBlur = scanLineGlow * (i + 1);
        ctx.strokeStyle = scanLineColor;
        ctx.lineWidth = scanLineThickness * (3 - i) / 2;
        ctx.stroke();
        ctx.restore();
      }

      // Draw the gradient overlay
      const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
      gradient.addColorStop(0, toRGBA(scanLineColor, 0));
      gradient.addColorStop(0.5, scanLineColor);
      gradient.addColorStop(1, toRGBA(scanLineColor, 0));

      ctx.save();
      const scanLineWidth = 40; // Fixed width for gradient
      const dx = scanLineWidth * sin;
      const dy = scanLineWidth * cos;
      
      ctx.beginPath();
      ctx.moveTo(startX - dx, startY + dy);
      ctx.lineTo(endX - dx, endY + dy);
      ctx.lineTo(endX + dx, endY - dy);
      ctx.lineTo(startX + dx, startY - dy);
      ctx.closePath();
      
      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.5;
      ctx.fill();
      ctx.restore();
    }

  }, [frame, backgroundColor, gridColor, scanLineColor, animationSpeed, gridSpacing, scanAngle, scanLineThickness, scanLineGlow, numberOfLines, gridLineThickness]);

  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={1920}
        height={1080}
        className="w-full h-full"
      />
    </div>
  );
};