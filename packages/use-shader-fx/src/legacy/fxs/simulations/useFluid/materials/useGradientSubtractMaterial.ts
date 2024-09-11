import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/face.vert";
import fragmentShader from "../shaders/gradientSubtract.frag";
import { MaterialProps } from "../../../types";
import {
   MATERIAL_BASIC_PARAMS,
   DEFAULT_TEXTURE,
} from "../../../../libs/constants";
import { createMaterialParameters } from "../../../../utils/createMaterialParameters";

export class GradientSubtractMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uPressure: { value: THREE.Texture };
      uVelocity: { value: THREE.Texture };
      texelSize: { value: THREE.Vector2 };
   };
}

export const useGradientSubtractMaterial = ({
   onBeforeInit,
}: MaterialProps) => {
   const gradientSubtractMaterial = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         ...createMaterialParameters(
            {
               uniforms: {
                  uPressure: { value: DEFAULT_TEXTURE },
                  uVelocity: { value: DEFAULT_TEXTURE },
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

   return gradientSubtractMaterial as GradientSubtractMaterial;
};
