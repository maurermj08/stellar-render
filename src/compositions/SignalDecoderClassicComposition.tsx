import React from 'react';
import { Composition } from 'remotion';
import { SignalDecoderClassic, SignalDecoderClassicProps, signalDecoderClassicSchema } from '../videos/SignalDecoderClassic';

export const SignalDecoderClassicComposition: React.FC<SignalDecoderClassicProps> = (props) => {
  return <SignalDecoderClassic {...props} />;
};

export { signalDecoderClassicSchema as signalDecoderClassicCompositionSchema };