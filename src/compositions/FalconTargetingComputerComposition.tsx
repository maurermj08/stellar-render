import { AbsoluteFill } from 'remotion';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';
import { FalconTargetingComputer } from '../videos/FalconTargetingComputer';

// Define the Zod schema for parameters
export const falconTargetingComputerSchema = z.object({
	backgroundColor: zColor().default('#90132C'),
	ovalColor: zColor().default('#F4C430'),
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
	gridColor: zColor().default('#F4C430'),
	animationSpeed: z.number().min(-360).max(360).default(8),
	shipColor: zColor().default('#c29c1e'),
	shipIndent: z.number().min(0).max(10).default(3),
	shipSpeed: z.number().min(1).max(100).default(50),
	shipSize: z.number().min(1).max(100).default(13),
	maxShips: z.number().min(0).max(10).default(5),
	speedVariation: z.number().min(0).max(50).default(30),
	shipSizeVariation: z.number().min(0).max(50).default(20),
});

// Define the composition component
export const FalconTargetingComputerComposition: React.FC<z.infer<typeof falconTargetingComputerSchema>> = (props) => {
	// Ensure all props have values by spreading with defaults
	const propsWithDefaults = {
		backgroundColor: props.backgroundColor ?? '#90132C',
		ovalColor: props.ovalColor ?? '#F4C430',
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
		gridColor: props.gridColor ?? '#F4C430',
		animationSpeed: props.animationSpeed ?? 8,
		shipColor: props.shipColor ?? '#c29c1e',
		shipIndent: props.shipIndent ?? 3,
		shipSpeed: (props.shipSpeed ?? 50) / 10,
		shipSize: (props.shipSize ?? 13) / 10,
		maxShips: props.maxShips ?? 5,
		speedVariation: props.speedVariation ?? 30,
		shipSizeVariation: props.shipSizeVariation ?? 20,
	};

	return (
		<AbsoluteFill>
			<FalconTargetingComputer {...propsWithDefaults} />
		</AbsoluteFill>
	);
};