import React, { useMemo } from 'react';
import { useCurrentFrame, random } from 'remotion';

interface SpaceGaugesProps {
  firstGaugeName: string;
  secondGaugeName: string;
  thirdGaugeName: string;
  toggleStars: boolean;
  starsSpeed: number;
  textColor: string;
  gaugeColor: string;
  criticalColor: string;
  cautionColor: string;
  optimalColor: string;
}

interface GaugeProps {
  label: string;
  value: number;
  textColor: string;
  gaugeColor: string;
  criticalColor: string;
  cautionColor: string;
  optimalColor: string;
}

const Gauge: React.FC<GaugeProps> = ({ label, value, textColor, gaugeColor, criticalColor, cautionColor, optimalColor }) => {
  const status = value < 20 ? 'CRITICAL' : value < 50 ? 'CAUTION' : 'OPTIMAL';
  const statusColor = value < 20 ? criticalColor : value < 50 ? cautionColor : optimalColor;

  return (
    <div className="relative w-96 h-96">
      <div className={`absolute inset-0 space-gauge-bg rounded-full shadow-lg ${value < 20 ? 'space-gauge-pulse' : ''}`} style={{ boxShadow: `0 0 30px ${gaugeColor}30` }} />
      <div className="absolute inset-8 rounded-full" style={{
        background: `conic-gradient(from 0deg, ${gaugeColor}80 0deg, ${gaugeColor}80 ${value * 3.6}deg, transparent ${value * 3.6}deg)`,
      }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="space-gauge-scanner absolute inset-0 rounded-full space-gauge-spin" style={{ background: `linear-gradient(to bottom, transparent, ${gaugeColor}10, transparent)` }} />
      </div>
      <div className="absolute inset-16 bg-gray-900 rounded-full flex flex-col items-center justify-center">
        <div className="text-5xl font-bold" style={{ color: gaugeColor }}>{value}%</div>
        <div className="text-2xl" style={{ color: statusColor }}>{status}</div>
      </div>
      <div className="absolute -bottom-16 left-0 right-0 text-center text-2xl uppercase tracking-wider" style={{ color: textColor }}>{label}</div>
    </div>
  );
};

const Particle: React.FC<{ seed: number; speed: number }> = ({ seed, speed }) => {
  const style = useMemo(() => ({
    left: `${random(seed) * 100}%`,
    top: `${random(seed + 1) * 100}%`,
    width: `${random(seed + 2) * 5 + 2}px`, // Slightly larger particles
    height: `${random(seed + 2) * 5 + 2}px`,
    animationDuration: speed === 0 ? '0s' : `${(random(seed + 3) * 10 + 10) / speed}s`, // Longer animation duration
    animationDelay: `${random(seed + 4) * -15}s`, // Random start time
    animationPlayState: speed === 0 ? 'paused' : 'running',
  }), [seed, speed]);

  return <div className="absolute bg-cyan-500 rounded-full opacity-50 space-gauge-float" style={style} />;
};

export const SpaceGauges: React.FC<SpaceGaugesProps> = ({
  firstGaugeName,
  secondGaugeName,
  thirdGaugeName,
  toggleStars,
  starsSpeed,
  textColor,
  gaugeColor,
  criticalColor,
  cautionColor,
  optimalColor,
}) => {
  const frame = useCurrentFrame();

  const gaugeValues = useMemo(() => ({
    [firstGaugeName]: Math.round(Math.sin(frame / 50) * 50 + 50),
    [secondGaugeName]: Math.round(Math.cos(frame / 60) * 50 + 50),
    [thirdGaugeName]: Math.round(Math.sin(frame / 70) * 50 + 50),
  }), [frame, firstGaugeName, secondGaugeName, thirdGaugeName]);

  const particles = useMemo(() => {
    if (!toggleStars) return null;
    return Array.from({ length: 50 }, (_, i) => (
      <Particle key={i} seed={i * 1000} speed={starsSpeed} />
    ));
  }, [toggleStars, starsSpeed]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      {toggleStars && (
        <div className="absolute inset-0 overflow-hidden">
          {particles}
        </div>
      )}
      <div className="flex gap-24">
        <Gauge
          label={firstGaugeName}
          value={gaugeValues[firstGaugeName]}
          textColor={textColor}
          gaugeColor={gaugeColor}
          criticalColor={criticalColor}
          cautionColor={cautionColor}
          optimalColor={optimalColor}
        />
        <Gauge
          label={secondGaugeName}
          value={gaugeValues[secondGaugeName]}
          textColor={textColor}
          gaugeColor={gaugeColor}
          criticalColor={criticalColor}
          cautionColor={cautionColor}
          optimalColor={optimalColor}
        />
        <Gauge
          label={thirdGaugeName}
          value={gaugeValues[thirdGaugeName]}
          textColor={textColor}
          gaugeColor={gaugeColor}
          criticalColor={criticalColor}
          cautionColor={cautionColor}
          optimalColor={optimalColor}
        />
      </div>
    </div>
  );
};
