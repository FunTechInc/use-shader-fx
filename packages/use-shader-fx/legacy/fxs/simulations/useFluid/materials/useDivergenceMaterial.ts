import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/main.vert";
import fragmentShader from "../shaders/divergence.frag";
import { MaterialProps } from "../../../types";
import { MATERIAL_BASIC_PARAMS } from "../../../../libs/constants";
import { createMaterialParameters } from "../../../../utils/createMaterialParameters";

export class DivergenceMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uVelocity: { value: THREE.Texture };
      texelSize: { value: THREE.Vector2 };
   };
}

export const useDivergenceMaterial = ({ onBeforeInit }: MaterialProps) => {
   const divergenceMaterial = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         ...createMaterialParameters(
            {
               uniforms: {
                  uVelocity: { value: null },
                  texelSize: { value: new THREE.Vector2() },
               },
               vertexShader: vertexShader,
               fragmentShader: fragmentShader,
            },
            onBeforeInit
         ),
         ...MATERIAL_BASIC_PARAMS,
      });
      return mat;
   }, [onBeforeInit]);

   return divergenceMaterial as DivergenceMaterial;
};
