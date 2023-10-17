import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/vorticity.frag";

type TUniforms = {
   resolution: { value: THREE.Vector2 };
   dataTex: { value: THREE.Texture };
};

export class VorticityMaterial extends THREE.ShaderMaterial {
   uniforms!: TUniforms;
}

export const useVorticityMaterial = () => {
   const vorticityMaterial = useMemo(
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

   return vorticityMaterial as VorticityMaterial;
};
