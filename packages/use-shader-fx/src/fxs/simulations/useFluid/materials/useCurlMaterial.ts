import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/curl.frag";
import { MaterialProps } from "../../../types";
import { MATERIAL_BASIC_PARAMS } from "../../../../libs/constants";
import { setOnBeforeCompile } from "../../../../utils/setOnBeforeCompile";

export class CurlMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uVelocity: { value: THREE.Texture };
      texelSize: { value: THREE.Vector2 };
   };
}

export const useCurlMaterial = ({
   onBeforeCompile,
   uniforms,
}: MaterialProps) => {
   const curlMaterial = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         uniforms: {
            uVelocity: { value: null },
            texelSize: { value: new THREE.Vector2() },
            ...uniforms,
         },
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
         ...MATERIAL_BASIC_PARAMS,
      });

      mat.onBeforeCompile = setOnBeforeCompile(onBeforeCompile);

      return mat;
   }, [onBeforeCompile, uniforms]);

   return curlMaterial as CurlMaterial;
};
