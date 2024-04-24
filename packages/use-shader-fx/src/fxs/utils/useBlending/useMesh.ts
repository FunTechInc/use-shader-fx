import { useMemo } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddObject } from "../../../utils/useAddObject";
import { MaterialProps } from "../../types";

export class BlendingMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      u_texture: { value: THREE.Texture };
      u_map: { value: THREE.Texture };
      u_alphaMap: { value: THREE.Texture };
      u_isAlphaMap: { value: boolean };
      u_mapIntensity: { value: number };
      u_brightness: { value: THREE.Vector3 };
      u_min: { value: number };
      u_max: { value: number };
      u_dodgeColor: { value: THREE.Color };
      u_isDodgeColor: { value: boolean };
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
            u_texture: { value: new THREE.Texture() },
            u_map: { value: new THREE.Texture() },
            u_alphaMap: { value: new THREE.Texture() },
            u_isAlphaMap: { value: false },
            u_mapIntensity: { value: 0.0 },
            u_brightness: { value: new THREE.Vector3() },
            u_min: { value: 0.0 },
            u_max: { value: 0.9 },
            u_dodgeColor: { value: new THREE.Color(0xffffff) },
            u_isDodgeColor: { value: false },
         },
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
      });
      if (onBeforeCompile) {
         mat.onBeforeCompile = onBeforeCompile;
      }
      return mat;
   }, [onBeforeCompile]) as BlendingMaterial;
   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);
   return { material, mesh };
};
