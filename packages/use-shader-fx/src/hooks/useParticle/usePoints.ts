import { useEffect, useMemo } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddObjects } from "../../utils/useAddObjects";

export class ParticleMaterial extends THREE.ShaderMaterial {
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

// 1 x 1　のサイズの中に 100x100 のパーティクルを設置するBufferGeometry用の配列を作成
const createBasicParticlePosition = () => {
   
   
   const count = 100;
   const arr = [];
   for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {         
         arr.push(
            ((i * 0.01) * 2 - 1), 
            ((j * 0.01) * 2 - 1),
            0
         );
      }
   }
   const positions = new Float32Array(arr);   
   return positions;
}

export type UsePointParams = {
   initGeometry?: THREE.BufferGeometry;
};



export const usePoints = (scene: THREE.Scene):[THREE.ShaderMaterial,THREE.Points]=> {

   const geometry = useMemo(() => {
      const geo = new THREE.BufferGeometry()
      const _initPosition = createBasicParticlePosition();
      geo.setAttribute("position", new THREE.BufferAttribute(_initPosition, 3));               
      return geo;
   }, []);

   const material = useMemo(
      () =>
         new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,            
            depthTest: true,
            transparent: true,               
            //   additive blending            
            blending: THREE.AdditiveBlending,
            uniforms: {
               uTime: { value: 0 },
               uMorphProgress: { value: 0 },
               uMorphLength: { value: 0. },
            }
         }),
      []
   );   
   
   
   const points = useAddObjects(scene, geometry, material, THREE.Points) as THREE.Points;      

   return [material, points];
}