import { useMemo } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddObject } from "../../../utils/useAddObject";
import { MaterialProps } from "../../types";
import { MATERIAL_BASIC_PARAMS } from "../../../libs/constants";
import { NOISE_PARAMS } from ".";
import { createMaterialParameters } from "../../../utils/createMaterialParameters";

export class NoiseMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uTime: { value: number };
      scale: { value: number };
      timeStrength: { value: number };
      noiseOctaves: { value: number };
      fbmOctaves: { value: number };
      warpOctaves: { value: number };
      warpDirection: { value: THREE.Vector2 };
      warpStrength: { value: number };
   };
}

export const useMesh = ({
   scene,
   onBeforeInit,
}: { scene: THREE.Scene } & MaterialProps) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         ...createMaterialParameters(
            {
               uniforms: {
                  uTime: { value: 0.0 },
                  scale: { value: NOISE_PARAMS.scale },
                  timeStrength: { value: NOISE_PARAMS.timeStrength },
                  noiseOctaves: { value: NOISE_PARAMS.noiseOctaves },
                  fbmOctaves: { value: NOISE_PARAMS.fbmOctaves },
                  warpOctaves: { value: NOISE_PARAMS.warpOctaves },
                  warpDirection: { value: NOISE_PARAMS.warpDirection },
                  warpStrength: { value: NOISE_PARAMS.warpStrength },
               },
               vertexShader: vertexShader,
               fragmentShader: fragmentShader,
            },
            onBeforeInit
         ),
         ...MATERIAL_BASIC_PARAMS,
      });
      return mat;
   }, [onBeforeInit]) as NoiseMaterial;
   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);
   return { material, mesh };
};
