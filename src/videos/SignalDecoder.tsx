import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, random } from 'remotion';
import { z } from 'zod';

// Define the properties for the SignalDecoder component
export interface SignalDecoderProps {
  // Main layout and styling
  backgroundColor: string;
  primaryColor: string;        // Main structural elements (grids, borders, highlighted elements, traveling rect, main bars)
  secondaryColor: string;      // Secondary bars, wave colors
  primaryTextColor: string;    // Headers, labels, main messages (DECODING, FREQ., scrolling messages)
  secondaryTextColor: string;  // Secondary content (random decoding text, frequency numbers)
  accentColor: string;         // Very light blue elements, almost white
  
  dashboardWidth: number;
  dashboardHeight: number;
  
  // Hexagon properties
  hexagonPadding: number;
  hexagonBorderThickness: number;
  hexagonBlurStdDeviation: number;
  fuzzyBlurStdDeviation: number;
  
  // Typography
  labelFontSize: number;
  textFontFamily: string;
  labelFontFamily: string;
  
  // Grid properties
  gridLineWidth: number;
  gridLineOpacity: number;
  
  // Traveling rectangle
  travelingRectHeight: number;
  travelingRectSpeedMultiplier: number;
  
  // Animated bars styling
  barsRoundedEnds: boolean;
  barBorderRadius: number;
  
  // Bar Set 1 properties
  barWidth1: number;
  barSpacing1: number;
  barMaxHeight1: number;
  barMinHeight1: number;
  barAnimationSpeedMultiplier1: number;
  
  // Bar Set 2 properties
  barWidth2: number;
  barSpacing2: number;
  barMaxHeight2: number;
  barMinHeight2: number;
  barAnimationSpeedMultiplier2: number;
  
  // Oscilloscope properties
  oscilloscopeGlobalSpeed: number;
  tracePointLifetimeFrames: number;
  tracePointSpawnIntervalFrames: number;
  tracePointSize: number;
  tracePointSizeVariation: number;
  
  // Wave 1 properties
  wave1Opacity: number;
  wave1AmplitudeFactor: number;
  wave1Frequency: number;
  wave1SpeedFactor: number;
  wave1TimeOffset: number;
  wave1Type: 'sine' | 'cosine' | 'sawtooth';
  
  // Wave 2 properties
  wave2Opacity: number;
  wave2AmplitudeFactor: number;
  wave2Frequency: number;
  wave2SpeedFactor: number;
  wave2TimeOffset: number;
  wave2Type: 'sine' | 'cosine' | 'sawtooth';
  
  // Wave 3 properties
  wave3Opacity: number;
  wave3AmplitudeFactor: number;
  wave3Frequency: number;
  wave3SpeedFactor: number;
  wave3TimeOffset: number;
  wave3Type: 'sine' | 'cosine' | 'sawtooth';
  
  // Wave 4 properties
  wave4Opacity: number;
  wave4AmplitudeFactor: number;
  wave4Frequency: number;
  wave4SpeedFactor: number;
  wave4TimeOffset: number;
  wave4Type: 'sine' | 'cosine' | 'sawtooth';
  
  // Scrolling text properties
  textLineFontSize: number;
  textMaxLines: number;
  textFadeOutDurationFrames: number;
  textNewMessageIntervalFrames: number;
  
  // Message arrays
  initialMessages: string[];
  dynamicMessages: string[];

  // Decoding Element properties
  decodingTextFontSize: number;
  decodingRandomTextFontSize: number;
  decodingTextFontFamily: string;
  decodingLineThickness: number;
  decodingRandomTextUpdateIntervalFrames: number;
  
  // Frequency Element properties
  frequencyTextFontSize: number;
  frequencyNumberFontSize: number;
  frequencyNumberUpdateIntervalFrames: number;
  
  useAurekBesh: boolean;
}

// Constants for the new Decoding element
const DECODING_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ??????        ";
const DECODING_TEXT_MARGIN_BOTTOM = 4; // Margin between "DECODING" and random text
const RANDOM_TEXT_MARGIN_BOTTOM = 4; // Margin between random text and line
const FREQUENCY_TEXT_MARGIN_BOTTOM = 4; // Margin between "FREQUENCY" and random numbers
const FREQUENCY_NUMBER_MARGIN_BOTTOM = 4; // Margin between random numbers and potential future elements
const AUREKBESH_LABEL_SIZE_MULTIPLIER = 1.2; // 20% increase for labels
const AUREKBESH_MESSAGE_SIZE_MULTIPLIER = 0.8; // 20% reduction for messages
const AUREKBESH_DECODING_SIZE_MULTIPLIER = 0.7; // 30% reduction for decoding elements

// Square grid pattern for right column
const SQUARE_PATTERN = [
  false, false, false, false, false, false, false, false, false, true, true, true, true, true, true, true,
  false, false, true, true, false, false, false, false, false, false, false, false, false, false, false, true, 
  false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
  false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
  false, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false,
];

export const SignalDecoder: React.FC<SignalDecoderProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate positions and dimensions
  const hexagonLeft = 80;
  const hexagonWidth = 860;
  const trapezoidSpacing = -188;
  const trapezoidLeft = hexagonLeft + hexagonWidth + trapezoidSpacing;
  const trapezoidWidth = 810;
  const textSpacing = 4;
  const textLeft = trapezoidLeft + trapezoidWidth + textSpacing;
  
  // Animation calculations
  const travelingRectY = ((frame * props.travelingRectSpeedMultiplier) % (1080 + props.travelingRectHeight)) - props.travelingRectHeight;
  
  // Color mappings from consolidated colors
  const hexagonStrokeColor = props.primaryColor;
  const travelingRectColor = props.primaryColor + '66'; // Add alpha for transparency
  const animatedBarColor1 = props.primaryColor + 'CC'; // Increased opacity (was '80')
  const animatedBarColor2 = props.accentColor + '99'; // Changed to accent color with transparency
  const wave1Color = props.accentColor;
  const wave2Color = props.primaryColor;
  const wave3Color = props.primaryTextColor;
  const wave4Color = props.secondaryColor;
  
  // Generate trace points for oscilloscope
  const generateTracePoints = (waveConfig: any, waveId: string) => {
    const points = [];
    // Ensure tracePointSpawnIntervalFrames is positive to avoid division by zero or infinite loops
    const spawnInterval = Math.max(1, props.tracePointSpawnIntervalFrames);
    const currentSpawnCycleFrame = Math.floor(frame / spawnInterval) * spawnInterval;
    
    // Generate points for recent spawn frames
    for (let spawnFrame = Math.max(0, currentSpawnCycleFrame - props.tracePointLifetimeFrames); spawnFrame <= currentSpawnCycleFrame; spawnFrame += spawnInterval) {
      const age = frame - spawnFrame;
      if (age >= 0 && age <= props.tracePointLifetimeFrames) {
        // 't' here is a time-like parameter for the wave function, derived from spawnFrame and speedFactor
        const t_param = spawnFrame * 0.01 * waveConfig.speedFactor * props.oscilloscopeGlobalSpeed;
        // yPos is the vertical position along the trapezoid, oscillating based on wave progress
        // The original HTML used (time * speed) % (Math.PI * 2) then scaled to 0-1080.
        // Let's use a similar approach for yPos to make it cycle through the 0-1080 range.
        const waveProgress = (t_param + waveConfig.timeOffset) % (Math.PI * 2); // Add timeOffset here
        const yPos = (waveProgress / (Math.PI * 2)) * 1080;
        
        const leftEdgeAtY = 432 - (yPos / 1080) * 432;
        const trapezoidWidthAtY = 810 - leftEdgeAtY;
        const centerX = leftEdgeAtY + trapezoidWidthAtY * 0.5;
        const amplitude = trapezoidWidthAtY * waveConfig.amplitudeFactor;
        
        let waveValue;
        // The wave function itself should depend on yPos (spatial frequency) and t_param (temporal evolution/offset)
        const spatialTerm = yPos / Math.max(1, waveConfig.frequency); // Avoid division by zero
        const temporalTerm = t_param; // Already includes speedFactor and timeOffset effectively through t_param and waveProgress

        if (waveConfig.type === 'sawtooth') {
          const phase = (spatialTerm + temporalTerm) % (Math.PI * 2);
          waveValue = (phase / Math.PI) - 1;
        } else if (waveConfig.type === 'cosine') {
          waveValue = Math.cos(spatialTerm + temporalTerm);
        } else { // sine
          waveValue = Math.sin(spatialTerm + temporalTerm);
        }
        
        const x = centerX + waveValue * amplitude;
        const opacity = waveConfig.opacity * (1.0 - age / Math.max(1, props.tracePointLifetimeFrames));
        const sizeVariation = (random(`${waveId}-${spawnFrame}-sizevar`) - 0.5) * 2 * props.tracePointSizeVariation;
        const size = Math.max(0.1, props.tracePointSize * (1 + sizeVariation));
        
        if (yPos >= 0 && yPos <= 1080 && x >= leftEdgeAtY && x <= leftEdgeAtY + trapezoidWidthAtY && opacity > 0) {
          points.push({ x, y: yPos, opacity, size, id: `${waveId}-point-${spawnFrame}` });
        }
      }
    }
    return points;
  };

  // Generate animated bar heights
  const generateBarHeights = (count: number, maxHeight: number, minHeight: number, seed: string, speedMultiplier: number) => {
    // Base interval in ms (e.g., 150ms from HTML), adjusted by speedMultiplier
    // Convert to frames: (base_interval_ms / 1000) * fps
    const baseUpdateIntervalMs = 150;
    const effectiveIntervalMs = baseUpdateIntervalMs / Math.max(0.1, speedMultiplier);
    const barUpdateIntervalFrames = Math.max(1, Math.round((effectiveIntervalMs / 1000) * fps));
    
    const barUpdateFrameSeed = Math.floor(frame / barUpdateIntervalFrames) * barUpdateIntervalFrames;
    const heights = [];
    for (let i = 0; i < count; i++) {
      const height = random(`${seed}-${i}-${barUpdateFrameSeed}`) * (maxHeight - minHeight) + minHeight;
      heights.push(height);
    }
    return heights;
  };

  // Wave configurations
  const waves = [
    {
      id: 'wave1',
      color: wave1Color,
      opacity: props.wave1Opacity,
      amplitudeFactor: props.wave1AmplitudeFactor,
      frequency: props.wave1Frequency,
      speedFactor: props.wave1SpeedFactor,
      timeOffset: props.wave1TimeOffset,
      type: props.wave1Type,
    },
    {
      id: 'wave2',
      color: wave2Color,
      opacity: props.wave2Opacity,
      amplitudeFactor: props.wave2AmplitudeFactor,
      frequency: props.wave2Frequency,
      speedFactor: props.wave2SpeedFactor,
      timeOffset: props.wave2TimeOffset,
      type: props.wave2Type,
    },
    {
      id: 'wave3',
      color: wave3Color,
      opacity: props.wave3Opacity,
      amplitudeFactor: props.wave3AmplitudeFactor,
      frequency: props.wave3Frequency,
      speedFactor: props.wave3SpeedFactor,
      timeOffset: props.wave3TimeOffset,
      type: props.wave3Type,
    },
    {
      id: 'wave4',
      color: wave4Color,
      opacity: props.wave4Opacity,
      amplitudeFactor: props.wave4AmplitudeFactor,
      frequency: props.wave4Frequency,
      speedFactor: props.wave4SpeedFactor,
      timeOffset: props.wave4TimeOffset,
      type: props.wave4Type,
    },
  ];

  // Generate scrolling text lines with appearance frames
  const generateTextLinesWithAppearanceFrame = () => {
    const allMessages: { text: string; appearanceFrame: number; id: string }[] = [];
    
    props.initialMessages.forEach((msg, i) => {
      allMessages.push({
        text: msg,
        appearanceFrame: 0, // Initial messages appear at frame 0
        id: `initial-${i}`
      });
    });

    const dynamicMessageInterval = Math.max(1, props.textNewMessageIntervalFrames);
    // Start dynamic messages after initial ones, or simply from a specific frame if interval is 0 for initial.
    // Let's assume dynamic messages start appearing based on their interval from frame 0.
    const numDynamicMessagesPossible = Math.floor(frame / dynamicMessageInterval);

    for (let i = 0; i < numDynamicMessagesPossible; i++) {
      const messageSeed = `dynamic-msg-${i}`;
      const dynamicMessageIndex = Math.floor(random(messageSeed) * props.dynamicMessages.length);
      const appearanceFrameForThisMessage = (i + 1) * dynamicMessageInterval; // Stagger appearance

      // Only add if its appearance time has been reached (redundant due to loop limit, but good for clarity)
      // And ensure it's not a duplicate ID if props.dynamicMessages is small and random picks same index.
      // The id should be unique for each *instance* of a message.
      if (frame >= appearanceFrameForThisMessage) {
         const uniqueId = `dynamic-${i}-${dynamicMessageIndex}-${appearanceFrameForThisMessage}`;
        allMessages.push({
          text: props.dynamicMessages[dynamicMessageIndex],
          appearanceFrame: appearanceFrameForThisMessage,
          id: uniqueId
        });
      }
    }
    
    // Filter out messages that haven't appeared yet (though loop structure should handle this)
    // and sort by appearance frame to ensure correct order before slicing.
    const appearedMessages = allMessages
        .filter(m => frame >= m.appearanceFrame)
        .sort((a, b) => a.appearanceFrame - b.appearanceFrame);
    
    const maxLines = props.textMaxLines;
    if (appearedMessages.length > maxLines) {
      return appearedMessages.slice(-maxLines);
    }
    return appearedMessages;
  };

  const textLinesToRender = generateTextLinesWithAppearanceFrame();

  // Generate random text for the DECODING element
  const generateDecodingRandomText = () => {
    const updateInterval = Math.max(1, props.decodingRandomTextUpdateIntervalFrames);
    const seedTime = Math.floor(frame / updateInterval);
    let text = "";
    for (let i = 0; i < 10; i++) {
      text += DECODING_CHARS.charAt(
        Math.floor(random(`decoding-char-${seedTime}-${i}`) * DECODING_CHARS.length)
      );
    }
    return text;
  };
  const decodingRandomText = generateDecodingRandomText();

  // Generate random numbers for the FREQUENCY element
  const generateFrequencyRandomNumber = () => {
    const updateInterval = Math.max(1, props.frequencyNumberUpdateIntervalFrames);
    const seedTime = Math.floor(frame / updateInterval);
    const randomNum = Math.floor(random(`frequency-num-${seedTime}`) * 100000000);
    return randomNum.toString().padStart(10, '0');
  };
  const frequencyRandomNumber = generateFrequencyRandomNumber();

  // Calculate positions for the DECODING element parts
  // The target Y is the 2nd grid line in trapezoid (144px from top of trapezoid SVG)
  const decodingBaseY = 64; // Relative to props.hexagonPadding

  // "DECODING" text centered around decodingBaseY
  const decodingTextTop = decodingBaseY - (props.decodingTextFontSize / 2);
  // Random text below "DECODING" text
  const randomTextTop = decodingTextTop + props.decodingTextFontSize + DECODING_TEXT_MARGIN_BOTTOM;
  // Line below random text
  const lineTop = randomTextTop + props.decodingRandomTextFontSize + RANDOM_TEXT_MARGIN_BOTTOM;
  
  // "FREQUENCY" text below the line
  const frequencyTextTop = lineTop + props.decodingLineThickness + FREQUENCY_TEXT_MARGIN_BOTTOM * 2 + 20;
  // Random numbers below "FREQUENCY" text
  const frequencyNumberTop = frequencyTextTop + props.frequencyTextFontSize + FREQUENCY_TEXT_MARGIN_BOTTOM;
  // Line below frequency numbers
  const frequencyLineTop = frequencyNumberTop + props.frequencyNumberFontSize + FREQUENCY_NUMBER_MARGIN_BOTTOM;
  
  const decodingElementContainerLeft = trapezoidLeft + 80;
  const decodingElementContainerWidth = (hexagonLeft + hexagonWidth) - trapezoidLeft + 108;

  // Font calculations
  const labelFontFamily = props.useAurekBesh ? 'AurekBesh' : props.labelFontFamily;
  const messageFontFamily = props.useAurekBesh ? 'AurekBeshNarrow' : props.textFontFamily;
  const decodingTextFontFamily = props.useAurekBesh ? 'AurekBesh' : props.decodingTextFontFamily;
  const decodingRandomFontFamily = props.useAurekBesh ? 'AurekBeshNarrow' : props.decodingTextFontFamily;
  const frequencyTextFontFamily = props.useAurekBesh ? 'AurekBesh' : props.decodingTextFontFamily;
  const frequencyNumberFontFamily = props.useAurekBesh ? 'AurekBeshNarrow' : props.decodingTextFontFamily;
  
  const labelFontSize = props.useAurekBesh ? props.labelFontSize * AUREKBESH_LABEL_SIZE_MULTIPLIER : props.labelFontSize;
  const textLineFontSize = props.useAurekBesh ? props.textLineFontSize * AUREKBESH_MESSAGE_SIZE_MULTIPLIER : props.textLineFontSize;
  const decodingTextFontSize = props.useAurekBesh ? props.decodingTextFontSize * AUREKBESH_DECODING_SIZE_MULTIPLIER : props.decodingTextFontSize;
  const decodingRandomTextFontSize = props.useAurekBesh ? props.decodingRandomTextFontSize * AUREKBESH_DECODING_SIZE_MULTIPLIER : props.decodingRandomTextFontSize;
  const frequencyTextFontSize = props.useAurekBesh ? props.frequencyTextFontSize * AUREKBESH_DECODING_SIZE_MULTIPLIER : props.frequencyTextFontSize;
  const frequencyNumberFontSize = props.useAurekBesh ? props.frequencyNumberFontSize * AUREKBESH_DECODING_SIZE_MULTIPLIER : props.frequencyNumberFontSize;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: props.backgroundColor,
        color: props.accentColor,
      }}
    >
      {/* Dashboard container */}
      <div
        style={{
          width: props.dashboardWidth,
          height: props.dashboardHeight,
          position: 'relative',
        }}
      >
        
        {/* Hexagon Labels */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 2,
            height: 1080,
            width: 48,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {['5', '4', '3', '2', '1', '0', '1', '2', '3', '4', '5'].map((label, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}>
              <div
                style={{
                  width: 32,
                  height: 1,
                  background: props.primaryTextColor,
                  borderRadius: 2,
                  marginRight: 8,
                }}
              />
              <span
                style={{
                  fontFamily: labelFontFamily,
                  color: props.primaryTextColor,
                  fontSize: labelFontSize,
                  lineHeight: 1,
                  userSelect: 'none',
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Main Hexagon */}
        <div
          style={{
            position: 'absolute',
            left: hexagonLeft,
            top: props.hexagonPadding,
            width: hexagonWidth,
            height: 1080 - 2 * props.hexagonPadding,
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 860 1080">
            <defs>
              <clipPath id="hexagonClip">
                <polygon points="215,0 645,0 860,540 645,1080 215,1080 0,540" />
              </clipPath>
              <filter id="fuzzyBlur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation={props.fuzzyBlurStdDeviation} />
              </filter>
              <filter id="hexagonBlur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation={props.hexagonBlurStdDeviation} />
              </filter>
            </defs>

            {/* Traveling rectangle */}
            <g clipPath="url(#hexagonClip)">
              <rect
                x="0"
                y={travelingRectY}
                width="860"
                height={props.travelingRectHeight}
                fill={travelingRectColor}
                filter="url(#fuzzyBlur)"
              />
            </g>

            {/* Hexagon outline */}
            <polygon
              points="215,0 645,0 860,540 645,1080 215,1080 0,540"
              fill="none"
              stroke={hexagonStrokeColor}
              strokeWidth={props.hexagonBorderThickness}
              filter="url(#hexagonBlur)"
            />

            {/* Horizontal grid lines */}
            <g stroke={props.primaryColor} strokeWidth={props.gridLineWidth} opacity={props.gridLineOpacity}>
              <line x1="167" y1="120" x2="693" y2="120" />
              <line x1="119" y1="240" x2="741" y2="240" />
              <line x1="72" y1="360" x2="788" y2="360" />
              <line x1="24" y1="480" x2="836" y2="480" />
              <line x1="0" y1="540" x2="860" y2="540" />
              <line x1="24" y1="600" x2="836" y2="600" />
              <line x1="72" y1="720" x2="788" y2="720" />
              <line x1="119" y1="840" x2="741" y2="840" />
              <line x1="167" y1="960" x2="693" y2="960" />
            </g>

            {/* Vertical grid lines */}
            <g stroke={props.primaryColor} strokeWidth={props.gridLineWidth} opacity={props.gridLineOpacity}>
              <line x1="215" y1="0" x2="107.5" y2="540" />
              <line x1="107.5" y1="540" x2="215" y2="1080" />
              <line x1="322.5" y1="0" x2="269" y2="540" />
              <line x1="269" y1="540" x2="322.5" y2="1080" />
              <line x1="430" y1="0" x2="430" y2="1080" />
              <line x1="537.5" y1="0" x2="591" y2="540" />
              <line x1="591" y1="540" x2="537.5" y2="1080" />
              <line x1="645" y1="0" x2="752.5" y2="540" />
              <line x1="752.5" y1="540" x2="645" y2="1080" />
            </g>

            {/* Animated bars set 1 */}
            <g clipPath="url(#hexagonClip)">
              {(() => {
                const barCount = Math.floor((875 + props.barSpacing1) / (props.barWidth1 + props.barSpacing1));
                const barHeights = generateBarHeights(barCount, props.barMaxHeight1, props.barMinHeight1, 'bars1', props.barAnimationSpeedMultiplier1);
                const elements = [];

                for (let i = 0; i < barCount; i++) {
                  const x = -15 + i * (props.barWidth1 + props.barSpacing1);
                  const upHeight = barHeights[i];
                  const downHeight = barHeights[(i + Math.floor(barCount / 2)) % barCount];

                  // Upward bars
                  elements.push(
                    <rect
                      key={`up-${i}`}
                      x={x}
                      y={540 - upHeight}
                      width={props.barWidth1}
                      height={upHeight}
                      fill={animatedBarColor1}
                      rx={props.barsRoundedEnds ? props.barBorderRadius : 0}
                      ry={props.barsRoundedEnds ? props.barBorderRadius : 0}
                    />
                  );

                  // Downward bars
                  elements.push(
                    <rect
                      key={`down-${i}`}
                      x={x}
                      y={540}
                      width={props.barWidth1}
                      height={downHeight}
                      fill={animatedBarColor1}
                      rx={props.barsRoundedEnds ? props.barBorderRadius : 0}
                      ry={props.barsRoundedEnds ? props.barBorderRadius : 0}
                    />
                  );
                }

                return elements;
              })()}
            </g>

            {/* Animated bars set 2 */}
            <g clipPath="url(#hexagonClip)">
              {(() => {
                const barCount = Math.floor((875 + props.barSpacing2) / (props.barWidth2 + props.barSpacing2));
                const barHeights = generateBarHeights(barCount, props.barMaxHeight2, props.barMinHeight2, 'bars2', props.barAnimationSpeedMultiplier2);
                const elements = [];

                for (let i = 0; i < barCount; i++) {
                  const x = -15 + i * (props.barWidth2 + props.barSpacing2);
                  const upHeight = barHeights[i];
                  const downHeight = barHeights[(i + Math.floor(barCount / 2)) % barCount];

                  // Upward bars
                  elements.push(
                    <rect
                      key={`up2-${i}`}
                      x={x}
                      y={540 - upHeight}
                      width={props.barWidth2}
                      height={upHeight}
                      fill={animatedBarColor2}
                      rx={props.barsRoundedEnds ? props.barBorderRadius : 0}
                      ry={props.barsRoundedEnds ? props.barBorderRadius : 0}
                    />
                  );

                  // Downward bars
                  elements.push(
                    <rect
                      key={`down2-${i}`}
                      x={x}
                      y={540}
                      width={props.barWidth2}
                      height={downHeight}
                      fill={animatedBarColor2}
                      rx={props.barsRoundedEnds ? props.barBorderRadius : 0}
                      ry={props.barsRoundedEnds ? props.barBorderRadius : 0}
                    />
                  );
                }

                return elements;
              })()}
            </g>
          </svg>
        </div>

        {/* Trapezoid Section */}
        <div
          style={{
            position: 'absolute',
            left: trapezoidLeft,
            top: props.hexagonPadding,
            width: trapezoidWidth,
            height: 1080 - 2 * props.hexagonPadding,
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 810 1080">
            <defs>
              <clipPath id="trapezoidClip">
                <polygon points="432,0 810,0 810,1080 0,1080" />
              </clipPath>
            </defs>

            {/* Trapezoid outline */}
            <polygon
              points="432,0 810,0 810,1080 0,1080"
              fill="none"
              stroke={hexagonStrokeColor}
              strokeWidth={props.hexagonBorderThickness}
              filter="url(#hexagonBlur)"
            />

            {/* Horizontal grid lines */}
            <g stroke={props.primaryColor} strokeWidth={props.gridLineWidth} opacity={props.gridLineOpacity}>
              <line x1="402.8" y1="72" x2="810" y2="72" />
              <line x1="374.4" y1="144" x2="810" y2="144" />
              <line x1="345.6" y1="216" x2="810" y2="216" />
              <line x1="316.8" y1="288" x2="810" y2="288" />
              <line x1="288" y1="360" x2="810" y2="360" />
              <line x1="259.2" y1="432" x2="810" y2="432" />
              <line x1="230.4" y1="504" x2="810" y2="504" />
              <line x1="201.6" y1="576" x2="810" y2="576" />
              <line x1="172.8" y1="648" x2="810" y2="648" />
              <line x1="144" y1="720" x2="810" y2="720" />
              <line x1="115.2" y1="792" x2="810" y2="792" />
              <line x1="86.4" y1="864" x2="810" y2="864" />
              <line x1="57.6" y1="936" x2="810" y2="936" />
              <line x1="28.8" y1="1008" x2="810" y2="1008" />
            </g>

            {/* Oscilloscope traces */}
            <g clipPath="url(#trapezoidClip)">
              {waves.map((wave) => {
                const tracePoints = generateTracePoints(wave, wave.id);
                return tracePoints.map((point) => ( // Removed index from map as point.id is unique key
                  <circle
                    key={point.id} // Use unique ID from point object
                    cx={point.x}
                    cy={point.y}
                    r={point.size}
                    fill={wave.color}
                    opacity={point.opacity}
                    filter="url(#hexagonBlur)" // Consider if blur should be on individual points or group
                  />
                ));
              })}
            </g>
          </svg>
        </div>

        {/* Scrolling Text Area */}
        <div
          style={{
            position: 'absolute',
            left: textLeft,
            textAlign: 'left',
            top: props.hexagonPadding,
            width: 320,
            height: 1030,
            padding: 20,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          {textLinesToRender.map((lineInfo) => {
            const lineAgeInFrames = frame - lineInfo.appearanceFrame;
            let opacity = 1;
            if (props.textFadeOutDurationFrames > 0 && lineAgeInFrames > props.textFadeOutDurationFrames) {
              opacity = Math.max(0, 1 - (lineAgeInFrames - props.textFadeOutDurationFrames) / props.textFadeOutDurationFrames);
            }
            
            return (
              <div
                key={lineInfo.id}
                style={{
                  fontFamily: messageFontFamily,
                  color: props.primaryTextColor,
                  fontSize: textLineFontSize,
                  lineHeight: 1.4,
                  marginBottom: 16,
                  opacity,
                  wordWrap: 'break-word',
                }}
              >
                {lineInfo.text}
              </div>
            );
          })}
        </div>

        {/* Decoding Element Area */}
        <div
          style={{
            position: 'absolute',
            left: decodingElementContainerLeft,
            top: props.hexagonPadding,
            width: decodingElementContainerWidth,
            height: 1080 - 2 * props.hexagonPadding,
            zIndex: 2,
          }}
        >
          {/* "DECODING" Text */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              textAlign: 'left',
              top: decodingTextTop,
              fontSize: decodingTextFontSize,
              color: props.primaryTextColor,
              fontWeight: 'bold',
              fontFamily: decodingTextFontFamily,
            }}
          >
            DECODING
          </div>

          {/* Randomly Generated Text */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              textAlign: 'left',
              top: randomTextTop,
              fontSize: decodingRandomTextFontSize,
              color: props.secondaryTextColor,
              fontFamily: decodingRandomFontFamily,
            }}
          >
            {decodingRandomText}
          </div>

          {/* Horizontal Line */}
          <div
            style={{
              position: 'absolute',
              left: decodingElementContainerWidth * 0.05 - 10,
              top: lineTop,
              width: decodingElementContainerWidth * 1,
              height: props.decodingLineThickness,
              backgroundColor: props.primaryTextColor,
            }}
          />

          {/* "FREQUENCY" Text */}
          <div style={{marginLeft: 28 }}>
            <div
                style={{
                position: 'absolute',
                width: '100%',
                textAlign: 'left',
                top: frequencyTextTop,
                fontSize: frequencyTextFontSize,
                color: props.primaryTextColor,
                fontWeight: 'bold',
                fontFamily: frequencyTextFontFamily,
                }}
            >
                FREQ.
            </div>

            {/* Randomly Generated Numbers */}
            <div
                style={{
                position: 'absolute',
                width: '100%',
                textAlign: 'left',
                top: frequencyNumberTop,
                fontSize: frequencyNumberFontSize,
                color: props.secondaryTextColor,
                fontFamily: frequencyNumberFontFamily,
                }}
            >
                {frequencyRandomNumber}
            </div>

            {/* Frequency Line */}
            <div
                style={{
                position: 'absolute',
                left: decodingElementContainerWidth * 0.05 + 12,
                top: frequencyLineTop,
                width: decodingElementContainerWidth * .8,
                height: props.decodingLineThickness,
                backgroundColor: props.primaryTextColor,
                }}
            />
            </div>
        </div>

        {/* Square Grid Column */}
        <div
          style={{
            position: 'absolute',
            right: 16,
            top: props.hexagonPadding,
            width: 16,
            height: 1080 - 2 * props.hexagonPadding,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {SQUARE_PATTERN.map((isColored, index) => (
            <div
              key={index}
              style={{
                width: 16,
                height: 16,
                backgroundColor: isColored ? props.primaryColor : 'transparent',
                border: `1px solid ${isColored ? props.primaryColor : 'transparent'}`,
                margin: 0,
                padding: 0,
                boxSizing: 'border-box',
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Schema for validating SignalDecoderProps using Zod
export const signalDecoderSchema = z.object({
  backgroundColor: z.string().default('black'),
  primaryColor: z.string().default('#00BFFF'),         // Main structural elements (grids, borders, highlighted elements)
  secondaryColor: z.string().default('#66AAFF'),       // Secondary bars, wave colors
  primaryTextColor: z.string().default('#4DC8FF'),     // Headers, labels, main messages
  secondaryTextColor: z.string().default('#A0DFFF'),   // Secondary content (lighter blue)
  accentColor: z.string().default('#F0F8FF'),          // Very light blue, almost white
  
  dashboardWidth: z.number().default(1920),
  dashboardHeight: z.number().default(1080),
  
  hexagonPadding: z.number().default(4),
  hexagonBorderThickness: z.number().default(6),
  hexagonBlurStdDeviation: z.number().default(2),
  fuzzyBlurStdDeviation: z.number().default(3),
  
  labelFontSize: z.number().default(38),
  textFontFamily: z.string().default('\'HandelGotDMed Regular\', Arial, sans-serif'),
  labelFontFamily: z.string().default('\'Chandrila\', \'HandelGothic Regular\', Arial, sans-serif'),
  
  gridLineWidth: z.number().default(1),
  gridLineOpacity: z.number().default(0.5),
  
  travelingRectHeight: z.number().default(120),
  travelingRectSpeedMultiplier: z.number().default(3),
  
  barsRoundedEnds: z.boolean().default(true),
  barBorderRadius: z.number().default(5),
  
  barWidth1: z.number().default(10),
  barSpacing1: z.number().default(5),
  barMaxHeight1: z.number().default(240),
  barMinHeight1: z.number().default(30),
  barAnimationSpeedMultiplier1: z.number().default(1),
  
  barWidth2: z.number().default(10),
  barSpacing2: z.number().default(5),
  barMaxHeight2: z.number().default(160),
  barMinHeight2: z.number().default(30),
  barAnimationSpeedMultiplier2: z.number().default(1),
  
  oscilloscopeGlobalSpeed: z.number().default(1),
  tracePointLifetimeFrames: z.number().default(150),
  tracePointSpawnIntervalFrames: z.number().default(3),
  tracePointSize: z.number().default(11),
  tracePointSizeVariation: z.number().default(0.3),
  
  wave1Opacity: z.number().default(0.9),
  wave1AmplitudeFactor: z.number().default(0.3),
  wave1Frequency: z.number().default(120),
  wave1SpeedFactor: z.number().default(3.0),
  wave1TimeOffset: z.number().default(2),
  wave1Type: z.enum(['sine', 'cosine', 'sawtooth']).default('sine'),
  
  wave2Opacity: z.number().default(0.7),
  wave2AmplitudeFactor: z.number().default(0.25),
  wave2Frequency: z.number().default(80),
  wave2SpeedFactor: z.number().default(3.2),
  wave2TimeOffset: z.number().default(1.5),
  wave2Type: z.enum(['sine', 'cosine', 'sawtooth']).default('cosine'),
  
  wave3Opacity: z.number().default(0.8),
  wave3AmplitudeFactor: z.number().default(0.7),
  wave3Frequency: z.number().default(150),
  wave3SpeedFactor: z.number().default(3.5),
  wave3TimeOffset: z.number().default(2.2),
  wave3Type: z.enum(['sine', 'cosine', 'sawtooth']).default('sine'),
  
  wave4Opacity: z.number().default(0.5),
  wave4AmplitudeFactor: z.number().default(0.35),
  wave4Frequency: z.number().default(90),
  wave4SpeedFactor: z.number().default(6.0),
  wave4TimeOffset: z.number().default(2.5),
  wave4Type: z.enum(['sine', 'cosine', 'sawtooth']).default('sawtooth'),
  
  textLineFontSize: z.number().default(24),
  textMaxLines: z.number().default(20),
  textFadeOutDurationFrames: z.number().default(15),
  textNewMessageIntervalFrames: z.number().default(90),
  
  initialMessages: z.array(z.string()).default([
    "Systems initializing...",
    "Communications array online",
    "Awaiting command protocols"
  ]),
  dynamicMessages: z.array(z.string()).default([
    "Hyperspace coordinates locked",
    "Ion engine running at optimal levels",
    "Deflector shields at maximum strength", 
    "Scanning for hostile vessels in sector",
    "Life support systems functioning normally",
    "Navigation computer online and ready",
    "Quantum flux stabilizers engaged",
    "Long-range communications established",
    "Gravitational field generators active",
    "Plasma conduits operating within parameters"
  ]),

  decodingTextFontSize: z.number().default(18),
  decodingRandomTextFontSize: z.number().default(16),
  decodingTextFontFamily: z.string().default('HandelGotDMed Regular, Arial, sans-serif'),
  decodingLineThickness: z.number().default(2),
  decodingRandomTextUpdateIntervalFrames: z.number().default(5),
  
  frequencyTextFontSize: z.number().default(18),
  frequencyNumberFontSize: z.number().default(16),
  frequencyNumberUpdateIntervalFrames: z.number().default(5),
  
  useAurekBesh: z.boolean().default(false),
});

