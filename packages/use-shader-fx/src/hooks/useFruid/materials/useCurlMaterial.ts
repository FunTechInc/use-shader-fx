import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/curl.frag";

export class CurlMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uVelocity: { value: THREE.Texture };
      texelSize: { value: THREE.Vector2 };
   };
}

export const useCurlMaterial = () => {
   const curlMaterial = useMemo(
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

   return curlMaterial as CurlMaterial;
};
