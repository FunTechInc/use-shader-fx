import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/init.frag";
import { MATERIAL_BASIC_PARAMS } from "../../../../libs/constants";

export const useInitialMaterial = () => {
   const initialMaterial = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
         ...MATERIAL_BASIC_PARAMS,
      });
      return mat;
   }, []);

   return initialMaterial as THREE.ShaderMaterial;
};
