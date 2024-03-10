import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { useParams } from "../../../utils/useParams";
import { HooksReturn } from "../../types";
import { useCreateWobble3D, UseCreateWobble3DProps } from "./useCreateWobble3D";
import { WobbleMaterialProps, WobbleMaterialConstructor } from "./useMaterial";
import { HooksProps3D } from "../types";

export type Wobble3DParams = {
   wobbleStrength?: number;
   wobblePositionFrequency?: number;
   wobbleTimeFrequency?: number;
   /** The roughness is attenuated by the strength of the wobble. It has no meaning if the roughness is set to 0 or if the material does not have a roughness param ,default:0 */
   wobbleShine?: number;
   warpStrength?: number;
   warpPositionFrequency?: number;
   warpTimeFrequency?: number;
   /** Refraction samples, default:6  */
   samples?: number;
   color0?: THREE.Color;
   color1?: THREE.Color;
   color2?: THREE.Color;
   color3?: THREE.Color;
   /** Mixing ratio with the material's original output color, 0~1 , defaulat : 1 */
   colorMix?: number;
   /** valid only for MeshPhysicalMaterial , default:0.5 */
   chromaticAberration?: number;
   /** valid only for MeshPhysicalMaterial , default:0.1 */
   anisotropicBlur?: number;
   /** valid only for MeshPhysicalMaterial , default:0.1 */
   distortion?: number;
   /** valid only for MeshPhysicalMaterial , default:0.1 */
   distortionScale?: number;
   /** valid only for MeshPhysicalMaterial , default:0.1 */
   temporalDistortion?: number;
   /** you can get into the rhythm ♪ , default:false */
   beat?: number | false;
};

export type Wobble3DObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   depthMaterial: THREE.MeshDepthMaterial;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const WOBBLE3D_PARAMS: Wobble3DParams = Object.freeze({
   beat: false,
   wobbleStrength: 0.3,
   wobblePositionFrequency: 0.5,
   wobbleTimeFrequency: 0.4,
   wobbleShine: 0,
   warpStrength: 1.7,
   warpPositionFrequency: 0.38,
   warpTimeFrequency: 0.12,
   samples: 6,
   color0: new THREE.Color(0xff0000),
   color1: new THREE.Color(0x00ff00),
   color2: new THREE.Color(0x0000ff),
   color3: new THREE.Color(0xffff00),
   colorMix: 1,
   chromaticAberration: 0.5,
   anisotropicBlur: 0.1,
   distortion: 0.1,
   distortionScale: 0.1,
   temporalDistortion: 0.1,
});

/**
 * @link https://github.com/FunTechInc/use-shader-fx
 */
export const useWobble3D = <T extends WobbleMaterialConstructor>({
   size,
   dpr,
   samples = 0,
   camera,
   geometry,
   baseMaterial,
   materialParameters,
}: HooksProps3D & UseCreateWobble3DProps & WobbleMaterialProps<T>): HooksReturn<
   Wobble3DParams,
   Wobble3DObject
> => {
   const scene = useMemo(() => new THREE.Scene(), []);

   const [updateUniform, { mesh, depthMaterial }] = useCreateWobble3D({
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
         depthMaterial,
         renderTarget,
         output: renderTarget.texture,
      },
   ];
};
