import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { HooksReturn } from "../../types";
import { useCreateWobble3D, UseCreateWobble3DProps } from "./useCreateWobble3D";
import { WobbleMaterialProps, WobbleMaterialConstructor } from "./useMaterial";
import { HooksProps3D } from "../types";
import { getDpr } from "../../../utils/getDpr";
import { CustomParams } from "../../../utils/setUniforms";

export type Wobble3DParams = {
   /** default : `0.3` */
   wobbleStrength?: number;
   wobblePositionFrequency?: number;
   wobbleTimeFrequency?: number;
   /** The roughness is attenuated by the strength of the wobble. It has no meaning if the roughness is set to 0 or if the material does not have a roughness param, default : `0` */
   wobbleShine?: number;
   warpStrength?: number;
   warpPositionFrequency?: number;
   warpTimeFrequency?: number;
   /** Manipulate the vertices using the color channels of this texture. The strength of the wobble changes depending on the g channel of this texture, default : `false` */
   wobbleMap?: THREE.Texture | false;
   /** Strength of wobbleMap, default : `0.03` */
   wobbleMapStrength?: number;
   /** Strength of distorting the 'normal' by wobbleMap, default : `0.0` */
   wobbleMapDistortion?: number;
   color0?: THREE.Color;
   color1?: THREE.Color;
   color2?: THREE.Color;
   color3?: THREE.Color;
   /** Mixing ratio with the material's original output color, 0~1 , defaulat : `1` */
   colorMix?: number;
   /** Threshold of edge. 0 for edge disabled, default : `0` */
   edgeThreshold?: number;
   /** Color of edge. default : `0x000000` */
   edgeColor?: THREE.Color;
   /** valid only for MeshPhysicalMaterial , default : `0.1` */
   chromaticAberration?: number;
   /** valid only for MeshPhysicalMaterial , default : `0.1` */
   anisotropicBlur?: number;
   /** valid only for MeshPhysicalMaterial , default : `0.0` */
   distortion?: number;
   /** valid only for MeshPhysicalMaterial , default : `0.1` */
   distortionScale?: number;
   /** valid only for MeshPhysicalMaterial , default : `0.0` */
   temporalDistortion?: number;
   /** Refraction samples, default : `6`  */
   samples?: number;
   /** you can get into the rhythm ♪ , default : `false` */
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
   wobblePositionFrequency: 0.3,
   wobbleTimeFrequency: 0.3,
   wobbleShine: 0,
   warpStrength: 0.3,
   warpPositionFrequency: 0.3,
   warpTimeFrequency: 0.3,
   wobbleMap: false,
   wobbleMapStrength: 0.03,
   wobbleMapDistortion: 0.0,
   samples: 6,
   color0: new THREE.Color(0xff0000),
   color1: new THREE.Color(0x00ff00),
   color2: new THREE.Color(0x0000ff),
   color3: new THREE.Color(0xffff00),
   colorMix: 1,
   edgeThreshold: 0.0,
   edgeColor: new THREE.Color(0x000000),
   chromaticAberration: 0.1,
   anisotropicBlur: 0.1,
   distortion: 0.0,
   distortionScale: 0.1,
   temporalDistortion: 0.0,
});

/**
 * @link https://github.com/FunTechInc/use-shader-fx
 */
export const useWobble3D = <T extends WobbleMaterialConstructor>({
   size,
   dpr,
   samples,
   isSizeUpdate,
   camera,
   geometry,
   baseMaterial,
   materialParameters,
   uniforms,
   onBeforeCompile,
   depthOnBeforeCompile,
}: HooksProps3D & UseCreateWobble3DProps & WobbleMaterialProps<T>): HooksReturn<
   Wobble3DParams,
   Wobble3DObject,
   CustomParams
> => {
   const _dpr = getDpr(dpr);

   const scene = useMemo(() => new THREE.Scene(), []);

   const [updateUniform, { mesh, depthMaterial }] = useCreateWobble3D({
      baseMaterial,
      materialParameters,
      scene,
      geometry,
      uniforms,
      onBeforeCompile,
      depthOnBeforeCompile,
   });

   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr: _dpr.fbo,
      samples,
      isSizeUpdate,
      depthBuffer: true,
   });

   const updateFx = useCallback(
      (
         props: RootState,
         newParams?: Wobble3DParams,
         customParams?: CustomParams
      ) => {
         updateUniform(props, newParams, customParams);
         return updateRenderTarget(props.gl);
      },
      [updateRenderTarget, updateUniform]
   );

   const setParams = useCallback(
      (newParams: Wobble3DParams, customParams?: CustomParams) => {
         updateUniform(null, newParams, customParams);
      },
      [updateUniform]
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
