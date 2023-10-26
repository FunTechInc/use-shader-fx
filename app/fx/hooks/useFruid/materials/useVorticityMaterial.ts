import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/vorticity.frag";

type TUniforms = {
   uVelocity: { value: THREE.Texture };
   uCurl: { value: THREE.Texture };
   curl: { value: number };
   dt: { value: number };
   texelSize: { value: THREE.Vector2 };
};

export class VorticityMaterial extends THREE.ShaderMaterial {
   uniforms!: TUniforms;
}

export const useVorticityMaterial = () => {
   const vorticityMaterial = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               uVelocity: { value: null },
               uCurl: { value: null },
               curl: { value: 0 },
               dt: { value: 0 },
               texelSize: { value: new THREE.Vector2() },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );

   return vorticityMaterial as VorticityMaterial;
};
