import { useMemo } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddObject } from "../../../utils/useAddObject";
import { MaterialProps } from "../../types";

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
   onBeforeCompile,
}: { scene: THREE.Scene } & MaterialProps) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         uniforms: {
            uTime: { value: 0.0 },
            scale: { value: 0.0 },
            timeStrength: { value: 0.0 },
            noiseOctaves: { value: 0 },
            fbmOctaves: { value: 0 },
            warpOctaves: { value: 0 },
            warpDirection: { value: new THREE.Vector2() },
            warpStrength: { value: 0.0 },
         },
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
      });

      if (onBeforeCompile) {
         mat.onBeforeCompile = onBeforeCompile;
      }
      return mat;
   }, [onBeforeCompile]) as NoiseMaterial;
   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);
   return { material, mesh };
};
