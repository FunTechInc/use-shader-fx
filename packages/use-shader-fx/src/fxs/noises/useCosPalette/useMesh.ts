import { useMemo } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddMesh } from "../../../utils/useAddMesh";

export class CosPaletteMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uTexture: { value: THREE.Texture };
      uRgbWeight: { value: THREE.Vector3 };
      uColor1: { value: THREE.Color };
      uColor2: { value: THREE.Color };
      uColor3: { value: THREE.Color };
      uColor4: { value: THREE.Color };
   };
}

export const useMesh = (scene: THREE.Scene) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               uTexture: { value: new THREE.Texture() },
               uRgbWeight: { value: new THREE.Vector3(0.299, 0.587, 0.114) },
               uColor1: { value: new THREE.Color().set(0.5, 0.5, 0.5) },
               uColor2: { value: new THREE.Color().set(0.5, 0.5, 0.5) },
               uColor3: { value: new THREE.Color().set(1, 1, 1) },
               uColor4: { value: new THREE.Color().set(0, 0.1, 0.2) },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );
   useAddMesh(scene, geometry, material);
   return material as CosPaletteMaterial;
};
