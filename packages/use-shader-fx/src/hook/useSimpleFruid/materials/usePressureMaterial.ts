import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/pressure.frag";

type TUniforms = {
   resolution: { value: THREE.Vector2 };
   dataTex: { value: THREE.Texture };
   alpha: { value: number };
   beta: { value: number };
};

export class PressureMaterial extends THREE.ShaderMaterial {
   uniforms!: TUniforms;
}

export const usePressureMaterial = () => {
   const pressureMaterial = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               resolution: { value: new THREE.Vector2() },
               dataTex: { value: null },
               alpha: { value: 0.0 },
               beta: { value: 0.0 },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );

   return pressureMaterial as PressureMaterial;
};
