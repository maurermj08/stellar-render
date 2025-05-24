import { AbsoluteFill } from 'remotion';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';
import { FalconTargetingComputer } from '../videos/FalconTargetingComputer';

// Define the Zod schema for parameters
export const falconTargetingComputerSchema = z.object({
	backgroundColor: zColor().default('#a52740'),
	ovalColor: zColor().default('#fff0c2'),
	ovalWidthPixels: z.number().min(50).max(1200).default(300),
	ovalHeightPixels: z.number().min(50).max(800).default(550),
	ovalPositionX: z.number().min(-1).max(1).default(0),
	ovalPositionY: z.number().min(-1).max(1).default(0),
	ovalOpacity: z.number().min(0).max(1).default(1),
	ovalThicknessPixels: z.number().min(1).max(100).default(1),
	ovalRotationDegrees: z.number().min(0).max(360).default(90),
	ovalSolidFill: z.boolean().default(false),
	gridSizePixels: z.number().min(50).max(2000).default(1100),
	gridSpacing: z.number().min(0).max(100).default(18),
	gridThickness: z.number().min(1).max(30).default(14),
	gridColor: zColor().default('#fff0c2'),
	animationSpeed: z.number().min(-360).max(360).default(10), // Degrees per second
});

// Define the composition component
export const FalconTargetingComputerComposition: React.FC<z.infer<typeof falconTargetingComputerSchema>> = (props) => {
	// Ensure all props have values by spreading with defaults
	const propsWithDefaults = {
		backgroundColor: props.backgroundColor ?? '#a52740',
		ovalColor: props.ovalColor ?? '#fff0c2',
		ovalWidthPixels: props.ovalWidthPixels ?? 300,
		ovalHeightPixels: props.ovalHeightPixels ?? 550,
		ovalPositionX: props.ovalPositionX ?? 0,
		ovalPositionY: props.ovalPositionY ?? 0,
		ovalOpacity: props.ovalOpacity ?? 1,
		ovalThicknessPixels: props.ovalThicknessPixels ?? 1,
		ovalRotationDegrees: props.ovalRotationDegrees ?? 90,
		ovalSolidFill: props.ovalSolidFill ?? false,
		gridSizePixels: props.gridSizePixels ?? 1100,
		gridSpacing: props.gridSpacing ?? 18,
		gridThickness: props.gridThickness ?? 14,
		gridColor: props.gridColor ?? '#fff0c2',
		animationSpeed: props.animationSpeed ?? 10,
	};

	return (
		<AbsoluteFill>
			<FalconTargetingComputer {...propsWithDefaults} />
		</AbsoluteFill>
	);
};