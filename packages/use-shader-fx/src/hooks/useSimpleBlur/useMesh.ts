import { useMemo } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";

import { useAddMesh } from "../../utils/useAddMesh";

export class SampleMaterial extends THREE.ShaderMaterial {
   uniforms!: {      
      uTexture: { value: THREE.Texture };
      uResolution: { value: THREE.Vector2 };
      uBlurSize: { value: number };
   };
}

export const useMesh = (scene: THREE.Scene) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               uTexture: { value: new THREE.Texture() },
               uResolution: { value: new THREE.Vector2(0,0) },
               uBlurSize: { value: 1, }
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );
   useAddMesh(scene, geometry, material);
   return material as SampleMaterial;
};
