import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { WAVE_PARAMS } from ".";
import { useAddObject } from "../../../utils/useAddObject";
import { MaterialProps } from "../../types";
import { MATERIAL_BASIC_PARAMS } from "../../../libs/constants";
import { createMaterialParameters } from "../../../utils/createMaterialParameters";

export class WaveMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uEpicenter: { value: THREE.Vector2 };
      uProgress: { value: number };
      uStrength: { value: number };
      uWidth: { value: number };
      uMode: { value: number };
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
                  uEpicenter: { value: WAVE_PARAMS.epicenter },
                  uProgress: { value: WAVE_PARAMS.progress },
                  uStrength: { value: WAVE_PARAMS.strength },
                  uWidth: { value: WAVE_PARAMS.width },
                  uMode: { value: 0 },
               },
               vertexShader: vertexShader,
               fragmentShader: fragmentShader,
            },
            onBeforeInit
         ),
         ...MATERIAL_BASIC_PARAMS,
      });

      return mat;
   }, [onBeforeInit]) as WaveMaterial;

   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);

   return { material, mesh };
};
