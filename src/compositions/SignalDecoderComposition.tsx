import { AbsoluteFill } from 'remotion';
import { SignalDecoder, signalDecoderSchema, SignalDecoderProps } from '../videos/SignalDecoder';

// Re-export the schema which now includes the decoding element properties
export const signalDecoderCompositionSchema = signalDecoderSchema;

export const SignalDecoderComposition: React.FC<SignalDecoderProps> = (props) => {
  return (
    <AbsoluteFill>
      <SignalDecoder {...props} />
    </AbsoluteFill>
  );
};
