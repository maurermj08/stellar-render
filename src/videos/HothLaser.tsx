import React, { useRef, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion';

interface HothLaserProps {
  triangleCount: number;
  triangleSize: number;
}

export const HothLaser: React.FC<HothLaserProps> = ({ triangleCount, triangleSize }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const gridSize = 30;
  const centerX = Math.round(width / 2 / gridSize) * gridSize;
  const centerY = height - 50;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const drawGrid = () => {
      // Background
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1;

      for (let x = centerX; x <= width; x += gridSize) {
        drawVerticalLine(ctx, x);
      }
      for (let x = centerX - gridSize; x >= 0; x -= gridSize) {
        drawVerticalLine(ctx, x);
      }

      for (let y = centerY; y >= 0; y -= gridSize) {
        drawHorizontalLine(ctx, y);
      }
      for (let y = centerY + gridSize; y <= height; y += gridSize) {
        drawHorizontalLine(ctx, y);
      }

      // Random dots
      ctx.fillStyle = '#ffd700';
      const dotCount = Math.floor((width * height) / 1000);
      for (let i = 0; i < dotCount; i++) {
        const x = random('dot-x-' + i) * width;
        const y = random('dot-y-' + i) * height;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Angle lines
      const radius = Math.max(width, height);
      ctx.strokeStyle = '#ffd700';
      const angles = [0, 30, 60, 90, 120, 150, 180];
      
      angles.forEach((angle) => {
        drawAngleLine(ctx, centerX, centerY, angle, radius);
      });

      // Draw distance lines
      drawDistanceLines(ctx, centerX, centerY, radius);

      // Draw triangles and get their positions
      const triangles = drawTriangles(ctx, centerX, centerY, radius, triangleCount, triangleSize);

      // Draw target triangle with triangle positions
      drawTargetTriangle(ctx, centerX, height, frame, fps, triangles, triangleSize);

      // Draw bottom curved line
      drawBottomCurvedLine(ctx, width, height, centerX, centerY);
    };

    drawGrid();
  }, [frame, width, height, centerX, centerY, triangleCount, triangleSize, fps]);

  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

function drawVerticalLine(ctx: CanvasRenderingContext2D, x: number) {
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, ctx.canvas.height);
  ctx.stroke();
}

function drawHorizontalLine(ctx: CanvasRenderingContext2D, y: number) {
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(ctx.canvas.width, y);
  ctx.stroke();
}

function drawAngleLine(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, angle: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  const endX = centerX + radius * Math.cos(angle * Math.PI / 180);
  const endY = centerY - radius * Math.sin(angle * Math.PI / 180);
  ctx.lineTo(endX, endY);
  
  ctx.lineWidth = (angle === 0 || angle === 90 || angle === 180) ? 2 : 1;
  ctx.stroke();
}

function drawDistanceLines(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) {
  ctx.strokeStyle = '#ffd700';

  const startAngle = 30 * Math.PI / 180;
  const endAngle = 150 * Math.PI / 180;
  
  // Move the adjustedCenterY down by 500 pixels
  const adjustedCenterY = centerY + 700; // Changed from 200 to 700

  for (let i = 0; i < 4; i++) {
    const t = 0.8 - (i * 0.2);
    const verticalAdjustment = i < 2 ? -100 : 100;
    
    ctx.lineWidth = (i === 1 || i === 2) ? 3 : 1;
    
    ctx.beginPath();
    ctx.moveTo(
      centerX + radius * Math.cos(startAngle),
      adjustedCenterY - radius * Math.sin(startAngle) + verticalAdjustment
    );
    
    const cp1x = centerX + radius * 0.5 * Math.cos((startAngle + endAngle) / 2);
    const cp1y = adjustedCenterY - radius * (0.5 + t) * Math.sin((startAngle + endAngle) / 2) + verticalAdjustment;

    ctx.quadraticCurveTo(
      cp1x, cp1y,
      centerX + radius * Math.cos(endAngle),
      adjustedCenterY - radius * Math.sin(endAngle) + verticalAdjustment
    );
    
    ctx.stroke();
  }

  // Add a more noticeable lighter area between the two center distance lines
  const gradientHeight = 300;
  const gradient = ctx.createLinearGradient(0, adjustedCenterY - gradientHeight / 2, 0, adjustedCenterY + gradientHeight / 2);
  gradient.addColorStop(0, 'rgba(107, 52, 16, 0)');
  gradient.addColorStop(0.3, 'rgba(179, 89, 29, 0.4)');
  gradient.addColorStop(0.5, 'rgba(210, 105, 30, 0.6)');
  gradient.addColorStop(0.7, 'rgba(179, 89, 29, 0.4)');
  gradient.addColorStop(1, 'rgba(107, 52, 16, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, adjustedCenterY - gradientHeight / 2, ctx.canvas.width, gradientHeight);
}

function drawBottomCurvedLine(ctx: CanvasRenderingContext2D, width: number, height: number, centerX: number, centerY: number) {
  ctx.beginPath();
  ctx.moveTo(0, height);
  
  // Calculate the bottom point of the 90-degree angle line
  const bottomPoint90Degree = height - 50; // Adjust this if needed to match your 90-degree line
  
  // First curve: from bottom left to the 90-degree point
  ctx.quadraticCurveTo(centerX / 2, bottomPoint90Degree, centerX, bottomPoint90Degree);
  
  // Second curve: from the 90-degree point to bottom right
  ctx.quadraticCurveTo(centerX + (width - centerX) / 2, bottomPoint90Degree, width, height);
  
  ctx.fillStyle = '#ffd700'; // Same color as the grid lines
  ctx.fill();
  
  ctx.strokeStyle = '#ffd700';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawTriangles(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  count: number,
  size: number
) {
  const startAngle = 30 * Math.PI / 180;
  const endAngle = 150 * Math.PI / 180;
  // Adjust this value to move triangles up or down
  const verticalOffset = 300;
  const adjustedCenterY = centerY + verticalOffset;

  ctx.fillStyle = '#ffd700';

  const triangles = [];
  for (let i = 0; i < count; i++) {
    const angle = startAngle + random(`triangle-angle-${i}`) * (endAngle - startAngle);
    const distance = radius * (0.2 + random(`triangle-distance-${i}`) * 0.6);

    const x = centerX + distance * Math.cos(angle);
    const y = adjustedCenterY - distance * Math.sin(angle);

    // Draw downward-facing triangle
    ctx.beginPath();
    ctx.moveTo(x, y + size / 2);
    ctx.lineTo(x - size / 2, y - size / 2);
    ctx.lineTo(x + size / 2, y - size / 2);
    ctx.closePath();
    ctx.fill();

    triangles.push({ x, y });
  }

  return triangles;
}

function lineIntersectsTriangle(
  lineStart: { x: number; y: number },
  lineEnd: { x: number; y: number },
  triangle: { x: number; y: number },
  triangleSize: number
) {
  // Define triangle vertices
  const v1 = { x: triangle.x, y: triangle.y + triangleSize / 2 };
  const v2 = { x: triangle.x - triangleSize / 2, y: triangle.y - triangleSize / 2 };
  const v3 = { x: triangle.x + triangleSize / 2, y: triangle.y - triangleSize / 2 };

  // Check if the line intersects any of the triangle's edges
  return (
    lineIntersectsSegment(lineStart, lineEnd, v1, v2) ||
    lineIntersectsSegment(lineStart, lineEnd, v2, v3) ||
    lineIntersectsSegment(lineStart, lineEnd, v3, v1)
  );
}

function lineIntersectsSegment(
  l1: { x: number; y: number },
  l2: { x: number; y: number },
  s1: { x: number; y: number },
  s2: { x: number; y: number }
) {
  const det = (l2.x - l1.x) * (s2.y - s1.y) - (l2.y - l1.y) * (s2.x - s1.x);
  if (det === 0) return false;

  const lambda = ((s2.y - s1.y) * (s2.x - l1.x) + (s1.x - s2.x) * (s2.y - l1.y)) / det;
  const gamma = ((l1.y - l2.y) * (s2.x - l1.x) + (l2.x - l1.x) * (s2.y - l1.y)) / det;

  return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
}

function drawTargetTriangle(
  ctx: CanvasRenderingContext2D, 
  centerX: number, 
  height: number, 
  frame: number,
  fps: number,
  triangles: { x: number; y: number }[],
  triangleSize: number
) {
  const bottomY = height - 50;
  const triangleWidth = 160;
  const triangleHeight = 1720;
  const duration = 16 * fps;
  const intersectionDuration = 5 * fps;
  
  const baseProgress = (frame % duration) / duration;
  const baseAngle = interpolate(baseProgress, [0, 0.5, 1], [-Math.PI/2, Math.PI/2, -Math.PI/2]);

  const targetX = centerX + Math.cos(baseAngle) * triangleHeight;
  const targetY = bottomY - Math.sin(baseAngle) * triangleHeight;
  
  const lineStart = { x: centerX, y: bottomY };
  const lineEnd = { x: targetX, y: targetY };

  const intersectingTriangle = triangles.find(t => 
    lineIntersectsTriangle(lineStart, lineEnd, t, triangleSize)
  );

  let currentAngle = baseAngle;
  let currentWidth = triangleWidth;

  if (intersectingTriangle) {
    const intersectionFrame = frame % intersectionDuration;
    const intersectionProgress = intersectionFrame / intersectionDuration;
    
    currentWidth = interpolate(
      intersectionProgress,
      [0, 0.1, 0.9, 1],
      [triangleWidth, 10, 10, triangleWidth]
    );

    currentAngle = Math.atan2(bottomY - intersectingTriangle.y, intersectingTriangle.x - centerX);
  }

  // Draw the targeting triangle
  ctx.fillStyle = 'rgba(204, 153, 0, 0.7)';
  ctx.save();
  ctx.translate(centerX, bottomY);
  ctx.rotate(currentAngle);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-currentWidth / 2, -triangleHeight);
  ctx.lineTo(currentWidth / 2, -triangleHeight);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // Optionally, draw the line for debugging
  // ctx.strokeStyle = 'red';
  // ctx.beginPath();
  // ctx.moveTo(lineStart.x, lineStart.y);
  // ctx.lineTo(lineEnd.x, lineEnd.y);
  // ctx.stroke();
}
