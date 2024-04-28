import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/init.frag";
import { MaterialProps } from "../../../types";

export const useInitialMaterial = ({
   onBeforeCompile,
   uniforms,
}: MaterialProps) => {
   const initialMaterial = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         uniforms,
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
         depthTest: false,
         depthWrite: false,
      });
      if (onBeforeCompile) {
         mat.onBeforeCompile = onBeforeCompile;
      }
      return mat;
   }, [onBeforeCompile, uniforms]);

   return initialMaterial as THREE.ShaderMaterial;
};
