import { use, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddMesh } from "../utils/useAddMesh";

type TUniforms = {
   uTime: { value: number };
   uTexture: { value: THREE.Texture };
   xDir: { value: THREE.Vector2 };
   yDir: { value: THREE.Vector2 };
   xTimeStrength: { value: number };
   yTimeStrength: { value: number };
   xStrength: { value: number };
   yStrength: { value: number };
};

export class MetamorphoseMaterial extends THREE.ShaderMaterial {
   uniforms!: TUniforms;
}

export const useMesh = (scene: THREE.Scene) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               uTime: { value: 0.0 },
               uTexture: { value: null },
               xDir: { value: new THREE.Vector2(0, 0) },
               yDir: { value: new THREE.Vector2(0, 0) },
               xTimeStrength: { value: 0 },
               yTimeStrength: { value: 0 },
               xStrength: { value: 0 },
               yStrength: { value: 0 },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );
   useAddMesh(scene, geometry, material);
   return material as MetamorphoseMaterial;
};
