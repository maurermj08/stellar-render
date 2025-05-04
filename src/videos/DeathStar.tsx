import React, { useRef, useEffect, useState } from 'react';
import { useCurrentFrame } from 'remotion';

const RADIUS_FACTOR = 0.4;
const COLOR = '#ccc';
const DARKNESS_FACTOR = 0.7;
const TILT_ANGLE = 0 / 12;
const ROTATION_SPEED = 0.003;
const VERTICAL_LINES = 28;
const HORIZONTAL_LINES = 19;
const SQUARE_SIZE = 6;
const LASER_SQUARE_SIZE = 25;
const EQUATOR_LINE_WIDTH = 3;
const LASER_LINE_INDEX = 7;
const LASER_CIRCLE_ANGLE = (LASER_LINE_INDEX / VERTICAL_LINES) * Math.PI * 2 - Math.PI / 2;
const LASER_CIRCLE_RADIUS_FACTOR = 2 / 18;
const LASER_INDENT_FACTOR = 0.95;
const DRAW_VERTICAL_LINES = false;
const ASPECT_RATIO = 16 / 9;
const ROTATE_COLOR = true;

interface DeathStarProps {
  color: string;
  darknessFactor: number; 
  rotationSpeed: number;
}

export const DeathStar: React.FC<DeathStarProps> = ({
  color,
  darknessFactor,
  rotationSpeed
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frame = useCurrentFrame();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        let width, height;

        if (containerWidth / containerHeight > ASPECT_RATIO) {
          height = containerHeight;
          width = height * ASPECT_RATIO;
        } else {
          width = containerWidth;
          height = width / ASPECT_RATIO;
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

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;
    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * RADIUS_FACTOR;

    const drawSphere = (rotation: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;

      const getRotatedColor = (alpha: number = 1) => {
        if (ROTATE_COLOR) {
          const hue = frame % 360;
          return `hsla(${hue}, 100%, 50%, ${alpha})`;
        }
        return `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${alpha})`;
      };

      // Set tiltAngle to 0
      const tiltAngle = 0;

      // Calculate vertical offset based on tilt angle (will be 0)
      const verticalOffset = radius * Math.sin(tiltAngle);

      // Draw vertical lines with squares
      for (let i = 0; i < VERTICAL_LINES; i++) {
        const angle = (i / VERTICAL_LINES) * Math.PI * 2 - Math.PI / 2 + rotation;
        if (DRAW_VERTICAL_LINES) {
          ctx.beginPath();
        }
        for (let j = 0; j <= 180; j++) {
          const lat = (j - 90) * Math.PI / 180;
          let x = centerX + radius * Math.cos(lat) * Math.sin(angle);
          let y = centerY + radius * Math.sin(lat);
          let z = radius * Math.cos(lat) * Math.cos(angle);

          // Apply tilt rotation and vertical offset
          const tiltedY = y * Math.cos(tiltAngle) - z * Math.sin(tiltAngle) + verticalOffset;
          const tiltedZ = y * Math.sin(tiltAngle) + z * Math.cos(tiltAngle);
          y = tiltedY;
          z = tiltedZ;

          if (DRAW_VERTICAL_LINES && (z > 0 || j === 0 || j === 180)) {
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }

          // Squares
          if (j % 10 === 0) {
            const darkness = Math.max(0, Math.min(1, ((radius - z) / (2 * radius)) * (darknessFactor / 100)));
            const alpha = 1 - darkness;
            const squareColor = getRotatedColor(alpha);
            
            ctx.fillStyle = squareColor;
            if (i === LASER_LINE_INDEX && j === 40) {
              ctx.fillRect(x - LASER_SQUARE_SIZE / 2, y - LASER_SQUARE_SIZE / 2, LASER_SQUARE_SIZE, LASER_SQUARE_SIZE);
            } else if (!(i === LASER_LINE_INDEX && j >= 80 && j <= 100) &&
                       !(i === LASER_LINE_INDEX - 1 && j >= 80 && j <= 100) &&
                       !(i === LASER_LINE_INDEX + 1 && j >= 80 && j <= 100)) {
              ctx.fillRect(x - SQUARE_SIZE / 2, y - SQUARE_SIZE / 2, SQUARE_SIZE, SQUARE_SIZE);
            }
          }
        }
        if (DRAW_VERTICAL_LINES) {
          ctx.stroke();
        }
      }

      // LASER CIRCLE
      const circleAngle = LASER_CIRCLE_ANGLE + rotation;
      const circleX = centerX + radius * Math.sin(circleAngle);
      const circleY = centerY;

      const circleRadius = LASER_CIRCLE_RADIUS_FACTOR * Math.PI * radius;
      const ellipseRadiusX = circleRadius * Math.abs(Math.cos(circleAngle));
      const ellipseRadiusY = circleRadius;

      const adjustedEllipseRadiusX = ellipseRadiusX * LASER_INDENT_FACTOR;
      const adjustedEllipseRadiusY = ellipseRadiusY * LASER_INDENT_FACTOR;

      // Apply vertical offset to tiltedCircleY
      const tiltedCircleY = circleY * Math.cos(tiltAngle) - radius * Math.sin(tiltAngle) * Math.cos(circleAngle) + verticalOffset;

      const laserCircleDarkness = Math.max(0, Math.min(1, ((radius - radius * Math.cos(circleAngle)) / (2 * radius)) * (darknessFactor / 100)));
      const laserCircleColor = getRotatedColor(1 - laserCircleDarkness);

      ctx.beginPath();
      ctx.ellipse(
        circleX,
        tiltedCircleY,
        adjustedEllipseRadiusX,
        adjustedEllipseRadiusY * Math.cos(tiltAngle),
        0,
        0,
        2 * Math.PI
      );
      ctx.strokeStyle = laserCircleColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw inner laser circle
      const innerRadiusFactor = 0.7;
      const maxInnerCircleAdjustment = 10;

      const adjustmentFactor = Math.abs(Math.sin(circleAngle));
      const innerCircleAdjustment = maxInnerCircleAdjustment * adjustmentFactor;

      const adjustedInnerCircleX = circleX + (centerX - circleX) * (innerCircleAdjustment / radius);

      ctx.beginPath();
      ctx.ellipse(
        adjustedInnerCircleX,
        tiltedCircleY,
        adjustedEllipseRadiusX * innerRadiusFactor,
        adjustedEllipseRadiusY * Math.cos(tiltAngle) * innerRadiusFactor,
        0,
        0,
        2 * Math.PI
      );
      ctx.strokeStyle = laserCircleColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Adjust the connecting lines for the inner circle
      ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const lineAngle = (i / 16) * Math.PI * 2;
        const outerX = circleX + adjustedEllipseRadiusX * Math.cos(lineAngle);
        const outerY = tiltedCircleY + adjustedEllipseRadiusY * Math.cos(tiltAngle) * Math.sin(lineAngle);
        const innerX = adjustedInnerCircleX + adjustedEllipseRadiusX * innerRadiusFactor * Math.cos(lineAngle);
        const innerY = tiltedCircleY + adjustedEllipseRadiusY * Math.cos(tiltAngle) * innerRadiusFactor * Math.sin(lineAngle);
        
        const lineDarkness = Math.max(0, Math.min(1, ((radius - radius * Math.cos(circleAngle + lineAngle)) / (2 * radius)) * (darknessFactor / 100)));
        const lineColor = getRotatedColor(1 - lineDarkness);
        
        ctx.strokeStyle = lineColor;
        ctx.beginPath();
        ctx.moveTo(outerX, outerY);
        ctx.lineTo(innerX, innerY);
        ctx.stroke();
      }

      // Draw horizontal equators
      ctx.beginPath();
      ctx.lineWidth = EQUATOR_LINE_WIDTH;
      ctx.strokeStyle = getRotatedColor();

      const drawEquatorLine = (yOffset: number) => {
        let isDrawing = true;
        ctx.beginPath();
        for (let i = 0; i <= 360; i++) {
          const angle = i * Math.PI / 180;
          const x = centerX + radius * Math.sin(angle);
          const z = radius * Math.cos(angle);
          const tiltedY = (centerY + yOffset) * Math.cos(tiltAngle) - z * Math.sin(tiltAngle) + verticalOffset;

          const isInLaserCircle = Math.abs(angle - circleAngle) <= LASER_CIRCLE_RADIUS_FACTOR * Math.PI;

          if (!isInLaserCircle) {
            if (!isDrawing) {
              ctx.moveTo(x, tiltedY);
              isDrawing = true;
            } else {
              ctx.lineTo(x, tiltedY);
            }
          } else {
            isDrawing = false;
          }
        }
        ctx.stroke();
      };

      drawEquatorLine(-4);
      drawEquatorLine(4);

      ctx.lineWidth = 1;

      // Scale the rotation speed
      rotation += rotationSpeed / 1000;
    };

    // Scale the rotation speed
    const rotation = frame * (rotationSpeed / 1000);
    drawSphere(rotation);
  }, [frame, dimensions, color, darknessFactor, rotationSpeed]);

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
