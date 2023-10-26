import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/advection.frag";

type TUniforms = {
   resolution: { value: THREE.Vector2 };
   dataTex: { value: THREE.Texture };
   attenuation: { value: number };
};

export class AdvectionMaterial extends THREE.ShaderMaterial {
   uniforms!: TUniforms;
}

export const useAdvectionMaterial = () => {
   const advectionMaterial = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               resolution: { value: new THREE.Vector2() },
               dataTex: { value: null },
               attenuation: { value: 1.0 }, //圧力のステップごとの減衰値
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );

   return advectionMaterial as AdvectionMaterial;
};
