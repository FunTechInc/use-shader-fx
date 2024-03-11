import { useMemo } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddObject } from "../../../utils/useAddObject";

export class ColorStrataMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uTexture: { value: THREE.Texture };
      isTexture: { value: boolean };
      scale: { value: number };
      noise: { value: THREE.Texture };
      noiseStrength: { value: THREE.Vector2 };
      isNoise: { value: boolean };
      laminateLayer: { value: number };
      laminateInterval: { value: THREE.Vector2 };
      laminateDetail: { value: THREE.Vector2 };
      distortion: { value: THREE.Vector2 };
      colorFactor: { value: THREE.Vector3 };
      uTime: { value: number };
      timeStrength: { value: THREE.Vector2 };
   };
}

export const useMesh = (scene: THREE.Scene) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               uTexture: { value: new THREE.Texture() },
               isTexture: { value: false },
               scale: { value: 1.0 },
               noise: { value: new THREE.Texture() },
               noiseStrength: { value: new THREE.Vector2(0, 0) },
               isNoise: { value: false },
               laminateLayer: { value: 1.0 },
               laminateInterval: { value: new THREE.Vector2(0.1, 0.1) },
               laminateDetail: { value: new THREE.Vector2(1, 1) },
               distortion: { value: new THREE.Vector2(0, 0) },
               colorFactor: { value: new THREE.Vector3(1, 1, 1) },
               uTime: { value: 0 },
               timeStrength: { value: new THREE.Vector2(0, 0) },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   ) as ColorStrataMaterial;

   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);

   return { material, mesh };
};
