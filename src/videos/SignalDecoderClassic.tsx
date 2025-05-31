import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, random } from 'remotion';
import { z } from 'zod';

// Define the properties for the SignalDecoderClassic component
export interface SignalDecoderClassicProps {
  // Main layout and styling
  backgroundColor: string;
  primaryColor: string;        // Main structural elements (grids, borders, highlighted elements, traveling rect, main bars)
  secondaryColor: string;      // Secondary bars
  primaryTextColor: string;    // Headers, labels, main messages (RANGE, POEDAM, scrolling messages)
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
  
  // Bar edge falloff properties
  barEdgeFalloffIntensity: number;    // 0-10, how much bars shrink at edges
  barEdgeFalloffRange: number;        // 0-10, how far from edges the falloff extends
  
  // Scrolling text properties
  textLineFontSize: number;
  textMaxLines: number;
  textFadeOutDurationFrames: number;
  textNewMessageIntervalFrames: number;
  
  // Message arrays
  initialMessages: string[];
  dynamicMessages: string[];

  // Decoding Element properties (now "RANGE")
  decodingTextFontSize: number;
  decodingRandomTextFontSize: number;
  decodingTextFontFamily: string;
  decodingLineThickness: number;
  decodingRandomTextUpdateIntervalFrames: number;
  
  // Frequency Element properties (now configurable POEDAM)
  frequencyText: string;           // The text to display (e.g., "POEDAMERON")
  frequencyTextCycleSpeed: number; // Speed of cycling in seconds (default 1)
  frequencyTextFontSize: number;
  frequencyNumberFontSize: number;
  frequencyNumberUpdateIntervalFrames: number;
  
  useAurekBesh: boolean;

  // Curved line properties
  curvedLineThickness: number;
  curvedLineFadeSpeed: number;         // 1-10, how fast lines fade in/out
  curvedLineFadeIntervalMin: number;   // 1-20, minimum seconds between fade changes
  curvedLineFadeIntervalMax: number;   // 1-20, maximum seconds between fade changes
}

// Constants for the new Range element
const DECODING_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ??????        ";
const DECODING_TEXT_MARGIN_BOTTOM = 4; // Margin between "RANGE" and random text
const RANDOM_TEXT_MARGIN_BOTTOM = 4; // Margin between random text and line
const FREQUENCY_TEXT_MARGIN_BOTTOM = 4; // Margin between "POEDAM" and random numbers
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

export const SignalDecoderClassic: React.FC<SignalDecoderClassicProps> = (props) => {
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
  const travelingRectColor = props.secondaryColor + 'CC'; // Changed to use secondaryColor for scan rectangle
  const animatedBarColor1 = props.primaryColor + 'CC'; // Increased opacity (was '80')
  const animatedBarColor2 = props.accentColor + '99'; // Changed to accent color with transparency
  
  // Generate animated bar heights
  // Generate animated bar heights with edge falloff
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
      
      // Apply edge falloff effect - bars get shorter towards the left and right edges (diamond/dome shape)
      const center = (count - 1) / 2; // Center position in the array
      const distanceFromCenter = Math.abs(i - center); // Distance from center
      const maxDistanceFromCenter = count / 2; // Maximum possible distance from center
      
      const falloffRange = (props.barEdgeFalloffRange / 10) * maxDistanceFromCenter; // Convert 0-10 to distance units
      const falloffIntensity = props.barEdgeFalloffIntensity / 10; // Convert 0-10 to 0-1
      
      let falloffMultiplier = 1;
      
      // Apply falloff if we're within the falloff range from center (towards edges)
      if (distanceFromCenter > (maxDistanceFromCenter - falloffRange)) {
        const falloffProgress = (distanceFromCenter - (maxDistanceFromCenter - falloffRange)) / falloffRange;
        falloffMultiplier = 1 - (falloffProgress * falloffIntensity);
        falloffMultiplier = Math.max(0.1, falloffMultiplier); // Minimum 10% height
      }
      
      heights.push(height * falloffMultiplier);
    }
    return heights;
  };

  // Calculate typing effect for each message
  const getTypedText = (fullText: string, appearanceFrame: number) => {
    const typingSpeed = 0.5; // Much faster: 0.5 frames per character (2 characters per frame)
    const framesSinceAppearance = frame - appearanceFrame;
    const charactersToShow = Math.floor(framesSinceAppearance / typingSpeed);
    return fullText.substring(0, Math.min(charactersToShow, fullText.length));
  };

  // Generate scrolling text lines with appearance frames
  const generateTextLinesWithAppearanceFrame = () => {
    const allMessages: { text: string; appearanceFrame: number; id: string }[] = [];
    
    // Stagger initial messages so they appear one at a time
    props.initialMessages.forEach((msg, i) => {
      const staggeredFrame = i * 60; // 4 seconds apart at 15fps (60 frames)
      allMessages.push({
        text: msg,
        appearanceFrame: staggeredFrame,
        id: `initial-${i}`
      });
    });

    // Much slower message interval: 8 seconds between new messages at 15fps
    const dynamicMessageInterval = Math.max(1, props.textNewMessageIntervalFrames * 8);
    const numDynamicMessagesPossible = Math.floor(frame / dynamicMessageInterval);

    for (let i = 0; i < numDynamicMessagesPossible; i++) {
      const messageSeed = `dynamic-msg-${i}`;
      const dynamicMessageIndex = Math.floor(random(messageSeed) * props.dynamicMessages.length);
      // Start dynamic messages after initial messages have all appeared
      const initialMessagesEndFrame = (props.initialMessages.length - 1) * 60;
      const appearanceFrameForThisMessage = initialMessagesEndFrame + (i + 1) * dynamicMessageInterval;

      if (frame >= appearanceFrameForThisMessage) {
         const uniqueId = `dynamic-${i}-${dynamicMessageIndex}-${appearanceFrameForThisMessage}`;
        allMessages.push({
          text: props.dynamicMessages[dynamicMessageIndex],
          appearanceFrame: appearanceFrameForThisMessage,
          id: uniqueId
        });
      }
    }
    
    const appearedMessages = allMessages
        .filter(m => frame >= m.appearanceFrame)
        .sort((a, b) => b.appearanceFrame - a.appearanceFrame); // Reverse sort for newest first
    
    const maxLines = props.textMaxLines;
    if (appearedMessages.length > maxLines) {
      return appearedMessages.slice(0, maxLines); // Take first maxLines (newest)
    }
    return appearedMessages;
  };

  const textLinesToRender = generateTextLinesWithAppearanceFrame();

  // Generate random text for the RANGE element
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

  // Generate cycling text for the frequency element
  const generateCyclingFrequencyText = () => {
    const fullText = props.frequencyText;
    
    // If text is 6 characters or less, just return it as is
    if (fullText.length <= 6) {
      return fullText;
    }
    
    // Calculate how many 6-character chunks we have
    const chunkCount = Math.ceil(fullText.length / 6);
    
    // Convert cycle speed from seconds to frames
    const cycleSpeedFrames = props.frequencyTextCycleSpeed * fps;
    
    // Determine which chunk to show based on current frame
    const currentChunkIndex = Math.floor(frame / cycleSpeedFrames) % chunkCount;
    
    // Extract the current 6-character chunk
    const startIndex = currentChunkIndex * 6;
    const endIndex = Math.min(startIndex + 6, fullText.length);
    
    return fullText.substring(startIndex, endIndex);
  };
  
  const displayedFrequencyText = generateCyclingFrequencyText();

  // Static "UKL" text for the frequency element
  const frequencyStaticText = "UKL";

  // Generate random numbers for the POEDAM element
  const generateFrequencyRandomNumber = () => {
    const updateInterval = Math.max(1, props.frequencyNumberUpdateIntervalFrames);
    const seedTime = Math.floor(frame / updateInterval);
    const randomNum = Math.floor(random(`frequency-num-${seedTime}`) * 100000000);
    return randomNum.toString().padStart(10, '0');
  };
  const frequencyRandomNumber = generateFrequencyRandomNumber();

  // Calculate positions for the RANGE element parts
  // The target Y is the 2nd grid line in trapezoid (144px from top of trapezoid SVG)
  const decodingBaseY = 64; // Relative to props.hexagonPadding

  // "RANGE" text centered around decodingBaseY
  const decodingTextTop = decodingBaseY - (props.decodingTextFontSize / 2);
  // Random text below "RANGE" text
  const randomTextTop = decodingTextTop + props.decodingTextFontSize + DECODING_TEXT_MARGIN_BOTTOM;
  // Line below random text
  const lineTop = randomTextTop + props.decodingRandomTextFontSize + RANDOM_TEXT_MARGIN_BOTTOM;
  
  // "POEDAM" text below the line
  const frequencyTextTop = lineTop + props.decodingLineThickness + FREQUENCY_TEXT_MARGIN_BOTTOM * 2 + 20;
  // Random numbers below "POEDAM" text
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

  // Generate curved line opacities with random fade intervals
  const generateCurvedLineOpacity = (lineIndex: number, baseOpacity: number) => {
    const minInterval = props.curvedLineFadeIntervalMin * fps; // Convert seconds to frames
    const maxInterval = props.curvedLineFadeIntervalMax * fps;
    
    // Generate a consistent random interval for this line
    const intervalSeed = `line-${lineIndex}-interval`;
    const fadeInterval = minInterval + random(intervalSeed) * (maxInterval - minInterval);
    
    // Determine which fade cycle we're in
    const cycleNumber = Math.floor(frame / fadeInterval);
    const frameInCycle = frame % fadeInterval;
    
    // Generate random fade duration for this cycle (50% to 80% of interval for longer bright periods)
    const fadeDurationSeed = `line-${lineIndex}-duration-${cycleNumber}`;
    const fadeDuration = (fadeInterval * 0.5) + (random(fadeDurationSeed) * fadeInterval * 0.3);
    
    // Determine if we should be brightening in this cycle (increased to 50% chance - more lines bright)
    const shouldBrightenSeed = `line-${lineIndex}-shouldbrighten-${cycleNumber}`;
    const shouldBrighten = random(shouldBrightenSeed) > 0.5; // 50% chance to brighten (up from 30%)
    
    if (!shouldBrighten) {
      // Default dimmed state - 30% of original opacity (70% dimmed)
      return baseOpacity * 0.3;
    }
    
    // Calculate brightness progress with faster speed
    const fadeSpeed = (props.curvedLineFadeSpeed / 10) * 0.8; // Increased from 0.5 to 0.8 for faster fading
    const adjustedFadeDuration = fadeDuration / Math.max(0.1, fadeSpeed);
    
    if (frameInCycle < adjustedFadeDuration / 2) {
      // Brightening up from dim to full
      const brightenProgress = (frameInCycle) / (adjustedFadeDuration / 2);
      const easedProgress = 1 - ((1 - brightenProgress) * (1 - brightenProgress)); // Ease-out for smooth brightening
      const dimOpacity = baseOpacity * 0.3; // Start from 30% opacity
      return dimOpacity + (baseOpacity - dimOpacity) * easedProgress;
    } else if (frameInCycle < adjustedFadeDuration) {
      // Dimming back down to default dim state
      const dimProgress = (frameInCycle - adjustedFadeDuration / 2) / (adjustedFadeDuration / 2);
      const easedProgress = dimProgress * dimProgress; // Ease-in for smooth dimming
      const dimOpacity = baseOpacity * 0.3; // End at 30% opacity
      return baseOpacity - (baseOpacity - dimOpacity) * easedProgress;
    } else {
      // Fully dimmed (default state)
      return baseOpacity * 0.3;
    }
  };

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
            top: props.hexagonPadding, // Reverted to original value
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
          {['5', '4', '3', '2', '1', '1', '2', '3', '4', '5'].map((label, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column', // Stack line and number vertically
                alignItems: 'flex-end',  // Align line and number to the right
                marginRight: 8,          // Spacing from the right edge of the parent container
              }}
            >
              <div // Line
                style={{
                  width: 32,
                  height: 1,
                  background: props.primaryTextColor,
                  borderRadius: 2,
                  marginBottom: 2, // Space between line and number
                }}
              />
              <span // Number
                style={{
                  fontFamily: labelFontFamily,
                  color: props.primaryTextColor,
                  fontSize: labelFontSize - 4, // Keep previously reduced font size
                  lineHeight: 'normal',        // Use 'normal' for better text rendering
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
                  const downHeight = barHeights[i]; 

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
                  const downHeight = barHeights[i]; // Use same height instead of offset

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

        {/* Trapezoid Section - Waves removed, only outline remains */}
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

            {/* Curved lines */}
            <g>
              {/* Line 1 - Very slight curve on right side */}
              <path d="M 720 72 Q 780 576 730 1008" 
                    fill="none" 
                    strokeWidth={props.curvedLineThickness} 
                    stroke={props.accentColor}
                    opacity={generateCurvedLineOpacity(1, 0.9)}/>
              
              {/* Line 2 - Straight line from left to right */}
              <path d="M 344 288 L 700 1008" 
                    fill="none" 
                    strokeWidth={props.curvedLineThickness} 
                    stroke={props.accentColor}
                    opacity={generateCurvedLineOpacity(2, 0.85)}/>

              {/* Line 3 - Somewhat curved from 2nd grid line left to bottom grid line right of line 1 end */}
              <path d="M 394.4 144 Q 600 500 760 1008"
                    fill="none"
                    strokeWidth={props.curvedLineThickness}
                    stroke={props.primaryColor}
                    opacity={generateCurvedLineOpacity(3, 0.8)}/>

              {/* Line 4 - Moderately curved from 5th grid line left to bottom grid line left of line 2 end */}
              <path d="M 338 360 Q 600 500 690 1008"
                    fill="none"
                    strokeWidth={props.curvedLineThickness}
                    stroke={props.primaryColor}
                    opacity={generateCurvedLineOpacity(4, 0.85)}/>

              {/* Line 5 - Curved line, bulging right */}
              <path d="M 710 72 Q 760 360 182.8 648"
                    fill="none"
                    strokeWidth={props.curvedLineThickness}
                    stroke={props.secondaryColor}
                    opacity={generateCurvedLineOpacity(5, 0.7)}/>

              {/* Line 6 - Curved line, bulging right */}
              <path d="M 690 72 Q 750 540 172.8 1008"
                    fill="none"
                    strokeWidth={props.curvedLineThickness}
                    stroke={props.secondaryColor}
                    opacity={generateCurvedLineOpacity(6, 0.7)}/>

              {/* Line 7 - Small left to right straight line */}
              <path d="M 244 500 L 500 1008" 
                    fill="none" 
                    strokeWidth={props.curvedLineThickness} 
                    stroke={props.primaryColor}
                    opacity={generateCurvedLineOpacity(7, 0.85)}/>

              {/* Line 8 - Small right to straight line in bottom right */}
              <path d="M 790 700 L 650 1008" 
                    fill="none" 
                    strokeWidth={props.curvedLineThickness} 
                    stroke={props.primaryColor}
                    opacity={generateCurvedLineOpacity(8, 0.85)}/>

              {/* Line 9 - Moderately curved top left to bottom middle */}
              <path d="M 418 90 Q 600 500 500 1008"
                    fill="none"
                    strokeWidth={props.curvedLineThickness}
                    stroke={props.secondaryColor}
                    opacity={generateCurvedLineOpacity(9, 0.85)}/>

               {/* Line 10 - Small right to straight line in bottom right */}
               <path d="M 302 360 L 190 1008" 
                    fill="none" 
                    strokeWidth={props.curvedLineThickness} 
                    stroke={props.secondaryColor}
                    opacity={generateCurvedLineOpacity(10, 0.85)}/>          

               {/* Line 11 - Small right to straight line in bottom right */}
               <path d="M 318 330 Q 480 750 190 1008" 
                    fill="none" 
                    strokeWidth={props.curvedLineThickness} 
                    stroke={props.secondaryColor}
                    opacity={generateCurvedLineOpacity(11, 0.85)}/>  
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
            // Removed all flexbox properties to prevent squishing
          }}
        >
          {textLinesToRender.map((lineInfo) => {
            const lineAgeInFrames = frame - lineInfo.appearanceFrame;
            const typedText = getTypedText(lineInfo.text, lineInfo.appearanceFrame);
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
                  minHeight: textLineFontSize * 1.4, // Reserve space for the line even when typing
                }}
              >
                {typedText}
                {typedText.length < lineInfo.text.length && (
                  <span
                    style={{
                      color: props.primaryTextColor,
                      opacity: (frame % 30) < 15 ? 1 : 0, // Blinking cursor effect
                    }}
                  >
                    |
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Range Element Area */}
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
          {/* "RANGE" Text */}
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
            RANGE
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

          {/* Configurable cycling text (was "POEDAM") */}
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
                {displayedFrequencyText}
            </div>

            {/* Static "UKL" Text */}
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
                {frequencyStaticText}
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

// Schema for validating SignalDecoderClassicProps using Zod
export const signalDecoderClassicSchema = z.object({
  backgroundColor: z.string().default('rgb(0,0,0)'),
  primaryColor: z.string().default('#00BFFF'),         // Main structural elements (grids, borders, highlighted elements)
  secondaryColor: z.string().default('#0073FF'),       // Secondary bars
  primaryTextColor: z.string().default('#1886F4'),     // Headers, labels, main messages
  secondaryTextColor: z.string().default('#A0DFFF'),   // Secondary content (lighter blue)
  accentColor: z.string().default('#F0F8FF'),          // Very light blue, almost white
  
  dashboardWidth: z.number().default(1920),
  dashboardHeight: z.number().default(1080),
  
  hexagonPadding: z.number().default(4),
  hexagonBorderThickness: z.number().default(9),
  hexagonBlurStdDeviation: z.number().default(2),
  fuzzyBlurStdDeviation: z.number().default(3),
  
  labelFontSize: z.number().default(38),
  textFontFamily: z.string().default('\'HandelGotDMed Regular\', Arial, sans-serif'),
  labelFontFamily: z.string().default('\'Chandrila\', \'HandelGothic Regular\', Arial, sans-serif'),
  
  gridLineWidth: z.number().default(1),
  gridLineOpacity: z.number().default(0.5),
  
  travelingRectHeight: z.number().default(100),
  travelingRectSpeedMultiplier: z.number().default(2),
  
  barsRoundedEnds: z.boolean().default(true),
  barBorderRadius: z.number().default(5),
  
  barWidth1: z.number().default(10),
  barSpacing1: z.number().default(5),
  barMaxHeight1: z.number().default(490),
  barMinHeight1: z.number().default(30),
  barAnimationSpeedMultiplier1: z.number().default(0.8),
  
  barWidth2: z.number().default(10),
  barSpacing2: z.number().default(5),
  barMaxHeight2: z.number().default(253),
  barMinHeight2: z.number().default(28),
  barAnimationSpeedMultiplier2: z.number().default(1),
  
  // Bar edge falloff properties
  barEdgeFalloffIntensity: z.number().min(0).max(10).default(10),    // 0-10, how much bars shrink at edges
  barEdgeFalloffRange: z.number().min(0).max(10).default(10),        // 0-10, how far from edges the falloff extends
  
  textLineFontSize: z.number().default(24),
  textMaxLines: z.number().default(21),
  textFadeOutDurationFrames: z.number().default(500),
  textNewMessageIntervalFrames: z.number().default(5),
  
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

  decodingTextFontSize: z.number().default(36),
  decodingRandomTextFontSize: z.number().default(36),
  decodingTextFontFamily: z.string().default('HandelGotDMed Regular, Arial, sans-serif'),
  decodingLineThickness: z.number().default(3),
  decodingRandomTextUpdateIntervalFrames: z.number().default(30),
  
  frequencyText: z.string().default('POEDAMERON'),
  frequencyTextCycleSpeed: z.number().default(2.7),
  frequencyTextFontSize: z.number().default(30),
  frequencyNumberFontSize: z.number().default(28),
  frequencyNumberUpdateIntervalFrames: z.number().default(10),
  
  useAurekBesh: z.boolean().default(true),

  // Curved line properties
  curvedLineThickness: z.number().default(5),
  curvedLineFadeSpeed: z.number().min(1).max(10).default(2),         // 1-10, how fast lines fade in/out
  curvedLineFadeIntervalMin: z.number().min(1).max(20).default(5),   // 1-20, minimum seconds between fade changes
  curvedLineFadeIntervalMax: z.number().min(1).max(20).default(12),   // 1-20, maximum seconds between fade changes
});