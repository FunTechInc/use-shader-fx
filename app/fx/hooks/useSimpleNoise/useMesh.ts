import { use, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddMesh } from "../utils/useAddMesh";

type TUniforms = {
   uTexture: { value: THREE.Texture };
   uTime: { value: number };
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
               uTexture: { value: new THREE.Texture() },
               uTime: { value: 0.0 },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );
   useAddMesh(scene, geometry, material);
   return material as MetamorphoseMaterial;
};
