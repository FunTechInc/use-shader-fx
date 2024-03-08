import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { RootState } from "@react-three/fiber";
import { useCamera } from "../../../utils/useCamera";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { useParams } from "../../../utils/useParams";
import { HooksProps, HooksReturn } from "../../types";
import { useCreateWobble3D } from "./useCreateWobble3D";
import { WobbleMaterialProps, WobbleMaterialConstructor } from "./useMaterial";

export type Wobble3DParams = {
   /** you can get into the rhythm ♪ , default:false */
   beat?: number | false;
   /** `wobbleStrengthを0にすると、wobbleがstopします. noiseの計算にも影響します` */
   wobbleStrength?: number;
   wobblePositionFrequency?: number;
   wobbleTimeFrequency?: number;
   warpStrength?: number;
   warpPositionFrequency?: number;
   warpTimeFrequency?: number;
   color0?: THREE.Color;
   color1?: THREE.Color;
   color2?: THREE.Color;
   color3?: THREE.Color;
   /** マテリアルの本来の出力色との混合率 0~1 , defaulat : 1 */
   colorMix?: number;
   // transmission
   chromaticAberration?: number;
   anisotropicBlur?: number;
   distortion?: number;
   distortionScale?: number;
   temporalDistortion?: number;
};

export type Wobble3DObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const WOBBLE3D_PARAMS: Wobble3DParams = Object.freeze({
   beat: false,
   //wobble
   wobbleStrength: 0.3,
   wobblePositionFrequency: 0.5,
   wobbleTimeFrequency: 0.4,
   warpStrength: 1.7,
   warpPositionFrequency: 0.38,
   warpTimeFrequency: 0.12,
   color0: new THREE.Color(0xff0000),
   color1: new THREE.Color(0x00ff00),
   color2: new THREE.Color(0x0000ff),
   color3: new THREE.Color(0xffff00),
   colorMix: 1,
   // transmission
   chromaticAberration: 0.6,
   anisotropicBlur: 0.1,
   distortion: 0.1,
   distortionScale: 0.1,
   temporalDistortion: 0.2,
});

interface UseWobble3DProps extends HooksProps {
   /** default : THREE.IcosahedronGeometry(2,50) */
   geometry?: THREE.BufferGeometry;
}

/**
 * @link https://github.com/FunTechInc/use-shader-fx
 */
export const useWobble3D = <T extends WobbleMaterialConstructor>({
   size,
   dpr,
   samples = 0,
   geometry,
   baseMaterial,
   materialParameters,
}: UseWobble3DProps & WobbleMaterialProps<T>): HooksReturn<
   Wobble3DParams,
   Wobble3DObject
> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const camera = useCamera(size, "PerspectiveCamera");

   const [updateUniform, { mesh }] = useCreateWobble3D({
      baseMaterial,
      materialParameters,
      scene,
      geometry,
   });

   const [params, setParams] = useParams<Wobble3DParams>(WOBBLE3D_PARAMS);

   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr,
      samples,
      depthBuffer: true,
   });

   const updateFx = useCallback(
      (props: RootState, updateParams?: Wobble3DParams) => {
         const { gl } = props;
         updateParams && setParams(updateParams);
         updateUniform(props, params);
         return updateRenderTarget(gl);
      },
      [updateRenderTarget, updateUniform, params, setParams]
   );

   return [
      updateFx,
      setParams,
      {
         scene,
         mesh,
         camera,
         renderTarget,
         output: renderTarget.texture,
      },
   ];
};
