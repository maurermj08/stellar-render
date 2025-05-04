import {GalacticMapComposition, GalacticMapCompSchema} from './compositions/GalacticMapComposition';
import {RetroAudioComposition, RetroAudioCompSchema} from './compositions/RetroAudioComposition';
import {RetroMountainComposition, RetroMountainCompSchema} from './compositions/RetroMountainComposition';
import {GltfModel3DComposition, GltfModel3DCompSchema} from './compositions/GltfModel3DComposition';
import {Model3DComposition, Model3DCompSchema} from './compositions/Model3DComposition';
import {Planet3DComposition, Planet3DCompSchema} from './compositions/Planet3DComposition';
import {BalloonCloudsComposition, BalloonCloudsCompSchema} from './compositions/BalloonCloudsComposition';
import {RetroSunComposition, RetroSunCompSchema} from './compositions/RetroSunComposition';
import {HothLaserComposition, HothLaserCompSchema} from './compositions/HothLaserComposition';
import {SpaceGaugesComposition, SpaceGaugesCompSchema} from './compositions/SpaceGaugesComposition';
import {SpinningStarsComposition, SpinningStarsCompSchema} from './compositions/SpinningStarsComposition';
import {Composition, registerRoot} from 'remotion';
import {DeathStarComposition, deathStarSchema } from './compositions/DeathStarComposition';
import {TargetingComputerComposition, targetingComputerCompSchema} from './compositions/TargetingComputerComposition';
import {DonutShieldComposition, donutShieldCompSchema} from './compositions/DonutShieldComposition';
import {EpicRadarComposition, epicRadarCompSchema} from './compositions/EpicRadarComposition';
import {AlertSphereComposition, alertSphereCompSchema} from './compositions/AlertSphereComposition';
import {SimpleStarsComposition, SimpleStarsSchema} from './compositions/SimpleStarsComposition';
import {ScifiGridComposition, scifiGridSchema} from './compositions/ScifiGridComposition';
import './style.css';
import {compositions} from './compositions.config';

export const RemotionRoot: React.FC<{compositionId?: string}> = ({compositionId}) => {
  if (!compositionId || !(compositionId in compositions)) {
    throw new Error(
      `Please provide a valid composition ID. Available compositions: ${Object.keys(
        compositions
      ).join(', ')}`
    );
  }

  const selectedComp = compositions[compositionId as keyof typeof compositions];

  return (
    <>
      <Composition
        id={compositionId}
        {...selectedComp}
      />
    </>
  );
};