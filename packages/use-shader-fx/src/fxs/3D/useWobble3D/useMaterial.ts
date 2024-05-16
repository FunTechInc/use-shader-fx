import * as THREE from "three";
import { useMemo } from "react";
import { WOBBLE3D_PARAMS } from ".";
import { MaterialProps, OnBeforeInitParameters } from "../../types";
import { createMaterialParameters } from "../../../utils/createMaterialParameters";
import { rewriteVertexShader } from "./utils/rewriteVertexShader";
import { rewriteFragmentShader } from "./utils/rewriteFragmentShader";
import { resolveEachMaterial } from "./utils/resolveEachMaterial";

export class Wobble3DMaterial extends THREE.Material {
   uniforms!: {
      uTime: { value: number };
      uWobblePositionFrequency: { value: number };
      uWobbleTimeFrequency: { value: number };
      uWobbleStrength: { value: number };
      uWarpPositionFrequency: { value: number };
      uWarpTimeFrequency: { value: number };
      uWarpStrength: { value: number };
      uColor0: { value: THREE.Color };
      uColor1: { value: THREE.Color };
      uColor2: { value: THREE.Color };
      uColor3: { value: THREE.Color };
      uColorMix: { value: number };
      uEdgeThreshold: { value: number };
      uEdgeColor: { value: THREE.Color };
      uChromaticAberration: { value: number };
      uAnisotropicBlur: { value: number };
      uDistortion: { value: number };
      uDistortionScale: { value: number };
      uTemporalDistortion: { value: number };
      uRefractionSamples: { value: number };
   };
}

export type WobbleMaterialConstructor = new (opts: {
   [key: string]: any;
}) => THREE.Material;

type WobbleMaterialParams<T extends WobbleMaterialConstructor> =
   ConstructorParameters<T>[0];

export interface WobbleMaterialProps<T extends WobbleMaterialConstructor>
   extends MaterialProps {
   /** default:THREE.MeshPhysicalMaterial */
   baseMaterial?: T;
   materialParameters?: WobbleMaterialParams<T>;
   depthOnBeforeInit?: (parameters: OnBeforeInitParameters) => void;
   /**
    * Whether to apply more advanced `transmission` or not. valid only for `MeshPhysicalMaterial`. This is a function referring to `drei/MeshTransmissionMaterial`, default : `false`
    * @link https://github.com/pmndrs/drei?tab=readme-ov-file#meshtransmissionmaterial
    * */
   isCustomTransmission?: boolean;
}

export const useMaterial = <T extends WobbleMaterialConstructor>({
   baseMaterial,
   materialParameters,
   isCustomTransmission = false,
   onBeforeInit,
   depthOnBeforeInit,
}: WobbleMaterialProps<T>) => {
   const { material, depthMaterial } = useMemo(() => {
      const mat = new (baseMaterial || THREE.MeshPhysicalMaterial)(
         materialParameters || {}
      );

      Object.assign(mat.userData, {
         uniforms: {
            uTime: { value: 0 },
            uWobblePositionFrequency: {
               value: WOBBLE3D_PARAMS.wobblePositionFrequency,
            },
            uWobbleTimeFrequency: {
               value: WOBBLE3D_PARAMS.wobbleTimeFrequency,
            },
            uWobbleStrength: { value: WOBBLE3D_PARAMS.wobbleStrength },
            uWarpPositionFrequency: {
               value: WOBBLE3D_PARAMS.warpPositionFrequency,
            },
            uWarpTimeFrequency: { value: WOBBLE3D_PARAMS.warpTimeFrequency },
            uWarpStrength: { value: WOBBLE3D_PARAMS.warpStrength },
            uColor0: { value: WOBBLE3D_PARAMS.color0 },
            uColor1: { value: WOBBLE3D_PARAMS.color1 },
            uColor2: { value: WOBBLE3D_PARAMS.color2 },
            uColor3: { value: WOBBLE3D_PARAMS.color3 },
            uColorMix: { value: WOBBLE3D_PARAMS.colorMix },
            uEdgeThreshold: { value: WOBBLE3D_PARAMS.edgeThreshold },
            uEdgeColor: { value: WOBBLE3D_PARAMS.edgeColor },
            uChromaticAberration: {
               value: WOBBLE3D_PARAMS.chromaticAberration,
            },
            uAnisotropicBlur: { value: WOBBLE3D_PARAMS.anisotropicBlur },
            uDistortion: { value: WOBBLE3D_PARAMS.distortion },
            uDistortionScale: { value: WOBBLE3D_PARAMS.distortionScale },
            uTemporalDistortion: { value: WOBBLE3D_PARAMS.temporalDistortion },
            uRefractionSamples: { value: WOBBLE3D_PARAMS.refractionSamples },
            transmission: { value: 0 },
            _transmission: { value: 1 },
            transmissionMap: { value: null },
         },
      });

      mat.onBeforeCompile = (parameters) => {
         rewriteVertexShader(parameters);

         rewriteFragmentShader(parameters);

         resolveEachMaterial({
            parameters,
            mat,
            isCustomTransmission,
         });

         const cutomizedParams = createMaterialParameters(
            {
               fragmentShader: parameters.fragmentShader,
               vertexShader: parameters.vertexShader,
               // Because wobble3D uses userData to update uniforms.
               uniforms: mat.userData.uniforms,
            },
            onBeforeInit
         );
         parameters.fragmentShader = cutomizedParams.fragmentShader;
         parameters.vertexShader = cutomizedParams.vertexShader;

         Object.assign(parameters.uniforms, mat.userData.uniforms);
      };
      mat.needsUpdate = true;

      /*===============================================
		depthMaterial
		===============================================*/
      const depthMat = new THREE.MeshDepthMaterial({
         depthPacking: THREE.RGBADepthPacking,
      });
      depthMat.onBeforeCompile = (parameters) => {
         Object.assign(parameters.uniforms, mat.userData.uniforms);
         rewriteVertexShader(parameters);
         createMaterialParameters(parameters, depthOnBeforeInit);
      };
      depthMat.needsUpdate = true;

      return { material: mat, depthMaterial: depthMat };
   }, [
      materialParameters,
      baseMaterial,
      onBeforeInit,
      depthOnBeforeInit,
      isCustomTransmission,
   ]);

   return {
      material: material as Wobble3DMaterial,
      depthMaterial,
   };
};
