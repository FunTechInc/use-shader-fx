import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/divergence.frag";

type TUniforms = {
   uVelocity: { value: THREE.Texture };
   texelSize: { value: THREE.Vector2 };
};

export class DivergenceMaterial extends THREE.ShaderMaterial {
   uniforms!: TUniforms;
}

export const useDivergenceMaterial = () => {
   const divergenceMaterial = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               uVelocity: { value: null },
               texelSize: { value: new THREE.Vector2() },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );

   return divergenceMaterial as DivergenceMaterial;
};
