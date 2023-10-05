import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/divergence.frag";

type TUniforms = {
   resolution: { value: THREE.Vector2 };
   dataTex: { value: THREE.Texture };
};

export class DivergenceMaterial extends THREE.ShaderMaterial {
   uniforms!: TUniforms;
}

export const useDivergenceMaterial = () => {
   const divergenceMaterial = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               resolution: { value: new THREE.Vector2(0, 0) },
               dataTex: { value: null },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );

   return divergenceMaterial as DivergenceMaterial;
};
