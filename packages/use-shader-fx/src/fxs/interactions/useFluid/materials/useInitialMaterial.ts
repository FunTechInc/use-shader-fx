import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/init.frag";
import { MaterialProps } from "../../../types";

export const useInitialMaterial = ({ onBeforeCompile }: MaterialProps) => {
   const initialMaterial = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
         depthTest: false,
         depthWrite: false,
      });
      if (onBeforeCompile) {
         mat.onBeforeCompile = onBeforeCompile;
      }
      return mat;
   }, [onBeforeCompile]);

   return initialMaterial as THREE.ShaderMaterial;
};
