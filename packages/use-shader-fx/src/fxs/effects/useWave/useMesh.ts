import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { WAVE_PARAMS } from ".";
import { useAddObject } from "../../../utils/useAddObject";
import { MaterialProps } from "../../types";

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
   onBeforeCompile,
}: { scene: THREE.Scene } & MaterialProps) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         uniforms: {
            uEpicenter: { value: WAVE_PARAMS.epicenter },
            uProgress: { value: WAVE_PARAMS.progress },
            uStrength: { value: WAVE_PARAMS.strength },
            uWidth: { value: WAVE_PARAMS.width },
            uMode: { value: 0 },
         },
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
      });
      if (onBeforeCompile) {
         mat.onBeforeCompile = onBeforeCompile;
      }
      return mat;
   }, [onBeforeCompile]) as WaveMaterial;

   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);

   return { material, mesh };
};
