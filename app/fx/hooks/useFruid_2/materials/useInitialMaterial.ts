import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/init.frag";

export const useInitialMaterial = () => {
   const initialMaterial = useMemo(
      () =>
         new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            depthTest: false,
            depthWrite: false,
         }),
      []
   );

   return initialMaterial as THREE.ShaderMaterial;
};
