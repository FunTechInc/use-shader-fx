import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/pressure.frag";

export class PressureMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uPressure: { value: THREE.Texture };
      uDivergence: { value: THREE.Texture };
      texelSize: { value: THREE.Vector2 };
   };
}

export const usePressureMaterial = () => {
   const pressureMaterial = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               uPressure: { value: null },
               uDivergence: { value: null },
               texelSize: { value: new THREE.Vector2() },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );

   return pressureMaterial as PressureMaterial;
};
