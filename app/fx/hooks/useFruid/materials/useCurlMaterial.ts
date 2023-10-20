import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/curl.frag";

type TUniforms = {
   resolution: { value: THREE.Vector2 };
   uVelocity: { value: THREE.Texture };
};

export class CurlMaterial extends THREE.ShaderMaterial {
   uniforms!: TUniforms;
}

export const useCurlMaterial = () => {
   const curlMaterial = useMemo(
      () =>
         new THREE.ShaderMaterial({
            uniforms: {
               resolution: { value: new THREE.Vector2() },
               uVelocity: { value: null },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
         }),
      []
   );

   return curlMaterial as CurlMaterial;
};
