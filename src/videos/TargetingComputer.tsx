import React, { useCallback, useEffect } from 'react';
import { useCurrentFrame, useVideoConfig, continueRender, delayRender } from 'remotion';

const ACCELERATION_FACTOR = 5;

interface TargetingComputerProps {
  animationSpeed?: number;
  lineGap?: number;
  numberOfLines?: number;
  acceleration?: number;
  lineColor?: string;
  numberColor?: string;
  fontSize?: number; 
}

export const TargetingComputer: React.FC<TargetingComputerProps> = ({
  animationSpeed = 80,
  lineGap = 25,
  numberOfLines = 12,
  acceleration = 5,
  lineColor = '#ffff00',
  numberColor = '#ff0000',
  fontSize = 64, // Changed to a number (equivalent to 8xl in Tailwind)
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Convert props to actual values
  const actualAnimationSpeed = animationSpeed / 100;
  const actualLineGap = lineGap / 100;

  const [handle] = React.useState(() => delayRender());

  const drawXLine = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, leftX: number, rightX: number, topY: number, bottomY: number) => {
    ctx.beginPath();
    ctx.moveTo(leftX, topY);
    ctx.lineTo(rightX, bottomY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(leftX, bottomY);
    ctx.lineTo(rightX, topY);
    ctx.stroke();
  };

  const drawTrench = useCallback((ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const cornerRadius = 0;

    // Calculate X points for three sets of trench wall lines
    const topY = 0;
    const bottomY = canvasHeight - cornerRadius;
    const leftX1 = canvasWidth * 0.35;
    const rightX1 = canvasWidth * 0.65;
    const leftX2 = canvasWidth * 0.25;
    const rightX2 = canvasWidth * 0.75;
    const leftX3 = canvasWidth * 0;
    const rightX3 = canvasWidth * 1;
    const adjustForCornersXLeft = 8;
    const adjustForCornersXRight = 8;
    const adjustForCornersY = 4;

    // Draw three sets of X-shaped trench wall lines
    drawXLine(ctx, centerX, centerY, leftX1, rightX1, topY, bottomY - 6);
    drawXLine(ctx, centerX, centerY, leftX2, rightX2, topY, bottomY - 6);
    drawXLine(ctx, centerX, centerY, leftX3 + adjustForCornersXLeft, rightX3 - adjustForCornersXRight, adjustForCornersY, bottomY - adjustForCornersY);

    // Draw vertical lines
    const time = frame / (60 / actualAnimationSpeed);
    for (let i = 0; i < numberOfLines; i++) {
      const baseProgress = (time + i * actualLineGap) % 3;
      const progress = Math.pow(baseProgress / 3, acceleration) * 3;
      
      const topIntersectY = centerY - (centerY - cornerRadius) * progress;
      const bottomIntersectY = centerY + (canvasHeight - centerY - cornerRadius) * progress;
      const leftIntersectX = centerX - (centerX - leftX1) * progress;
      const rightIntersectX = centerX + (rightX1 - centerX) * progress;

      // Draw left vertical line
      ctx.beginPath();
      ctx.moveTo(leftIntersectX, topIntersectY);
      ctx.lineTo(leftIntersectX, bottomIntersectY);
      ctx.stroke();

      // Draw right vertical line
      ctx.beginPath();
      ctx.moveTo(rightIntersectX, topIntersectY);
      ctx.lineTo(rightIntersectX, bottomIntersectY);
      ctx.stroke();

      // Draw horizontal line
      if (bottomIntersectY < canvasHeight - cornerRadius) {
        ctx.beginPath();
        ctx.moveTo(leftIntersectX, bottomIntersectY);
        ctx.lineTo(rightIntersectX, bottomIntersectY);
        ctx.stroke();
      }
    }
  }, [frame, actualAnimationSpeed, actualLineGap, numberOfLines, acceleration, lineColor]);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = width * 0.9;  // Adjust as needed
    canvas.height = height * 0.7;  // Adjust as needed
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      drawTrench(ctx, canvas.width, canvas.height);
      const container = document.getElementById('trench-container');
      if (container) {
        container.innerHTML = '';
        container.appendChild(canvas);
      }
    }
    
    continueRender(handle);
  }, [width, height, drawTrench, handle]);

  const distance = Math.max(0, 900000 - frame * actualAnimationSpeed);
  const paddedDistance = Math.floor(distance).toString().padStart(6, '0');

  return (
    <div className="flex flex-col justify-between w-full h-full bg-black">
      <div 
        id="trench-container"
        className="w-[90%] h-[70%] mx-auto my-5 border rounded-3xl relative overflow-hidden" 
        style={{ borderColor: lineColor, borderWidth: "3px" }}
      />
      <div className="w-1/2 h-[15%] mb-[2%] mx-auto flex justify-center items-center border-2 rounded-3xl" style={{ borderColor: lineColor }}>
        <div className="flex mt-6 font-['SpaceStencil']" style={{ color: numberColor, fontSize: `${fontSize}px` }}>
          {paddedDistance.split('').map((digit, index) => (
            <div key={index} className="w-[1ch] text-center font-['SpaceStencil']">{digit}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
