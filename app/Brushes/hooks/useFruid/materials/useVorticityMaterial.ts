import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/vorticity.frag";

type TUniforms = {
   resolution: { value: THREE.Vector2 };
   uVelocity: { value: THREE.Texture };
   uCurl: { value: THREE.Texture };
   curl: { value: number };
   dt: { value: number };
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
               uVelocity: { value: null },
               uCurl: { value: null },
               curl: { value: 28 },
               dt: { value: 0.0 }, //時間ぽい
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );

   return vorticityMaterial as VorticityMaterial;
};
