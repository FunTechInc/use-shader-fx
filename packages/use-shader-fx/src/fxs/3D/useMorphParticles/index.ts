import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { HooksReturn } from "../../types";
import {
   useCreateMorphParticles,
   UseCreateMorphParticlesProps,
} from "./useCreateMorphParticles";
import { HooksProps3D } from "../types";

export type MorphParticlesParams = {
   /** progress value to morph vertices,0~1 */
   morphProgress?: number;
   blurAlpha?: number;
   blurRadius?: number;
   pointSize?: number;
   /** Since the color is extracted based on the attribute `uv`, the intended behavior will not occur if there is no uv in the attribute. */
   picture?: THREE.Texture | false;
   /** The alpha map is a grayscale texture that controls the opacity across the surface (black: fully transparent; white: fully opaque). use the green channel when sampling this texture. It also affects the size of the point. Default is false. */
   alphaPicture?: THREE.Texture | false;
   color0?: THREE.Color;
   color1?: THREE.Color;
   color2?: THREE.Color;
   color3?: THREE.Color;
   /** This maps to point,texture */
   map?: THREE.Texture | false;
   /** The alpha map is a grayscale texture that controls the opacity across the surface (black: fully transparent; white: fully opaque). use the green channel when sampling this texture. Default is false. */
   alphaMap?: THREE.Texture | false;
   /** `If ​​wobbleStrength is set to 0, wobble will stop. It will also affect noise calculation` */
   wobbleStrength?: number;
   wobblePositionFrequency?: number;
   wobbleTimeFrequency?: number;
   warpStrength?: number;
   warpPositionFrequency?: number;
   warpTimeFrequency?: number;
   /** Manipulate the vertices using the color channels of this texture. The strength of the displacement changes depending on the g channel of this texture */
   displacement?: THREE.Texture | false;
   /** Strength of displacement. The strength of displacement depends on g ch, but is the value multiplied by it , default:1 */
   displacementIntensity?: number;
   /** Strength to reflect color ch of displacement texture */
   displacementColorIntensity?: number;
   /** you can get into the rhythm ♪ , default:false */
   beat?: number | false;
};

export type MorphParticlesObject = {
   scene: THREE.Scene;
   points: THREE.Points;
   interactiveMesh: THREE.Mesh;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
   positions: Float32Array[];
   uvs: Float32Array[];
};

export const MORPHPARTICLES_PARAMS: MorphParticlesParams = Object.freeze({
   morphProgress: 0,
   blurAlpha: 0.9,
   blurRadius: 0.05,
   pointSize: 0.05,
   picture: false,
   alphaPicture: false,
   color0: new THREE.Color(0xff0000),
   color1: new THREE.Color(0x00ff00),
   color2: new THREE.Color(0x0000ff),
   color3: new THREE.Color(0xffff00),
   map: false,
   alphaMap: false,
   wobbleStrength: 0.0,
   wobblePositionFrequency: 0.5,
   wobbleTimeFrequency: 0.5,
   warpStrength: 0.5,
   warpPositionFrequency: 0.5,
   warpTimeFrequency: 0.5,
   displacement: false,
   displacementIntensity: 1,
   displacementColorIntensity: 0,
   beat: false,
});

/**
 * @link https://github.com/FunTechInc/use-shader-fx
 */
export const useMorphParticles = ({
   size,
   dpr,
   samples = 0,
   camera,
   geometry,
   positions,
   uvs,
}: HooksProps3D & UseCreateMorphParticlesProps): HooksReturn<
   MorphParticlesParams,
   MorphParticlesObject
> => {
   const scene = useMemo(() => new THREE.Scene(), []);

   const [
      updateUniform,
      {
         points,
         interactiveMesh,
         positions: generatedPositions,
         uvs: generatedUvs,
      },
   ] = useCreateMorphParticles({ scene, size, dpr, geometry, positions, uvs });

   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr,
      samples,
      depthBuffer: true,
   });

   const updateFx = useCallback(
      (props: RootState, updateParams?: MorphParticlesParams) => {
         updateUniform(props, updateParams);
         return updateRenderTarget(props.gl);
      },
      [updateRenderTarget, updateUniform]
   );

   const setParams = useCallback(
      (updateParams: MorphParticlesParams) => {
         updateUniform(null, updateParams);
      },
      [updateUniform]
   );

   return [
      updateFx,
      setParams,
      {
         scene,
         points,
         interactiveMesh,
         renderTarget,
         output: renderTarget.texture,
         positions: generatedPositions,
         uvs: generatedUvs,
      },
   ];
};
