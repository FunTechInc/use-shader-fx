import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/face.vert";
import fragmentShader from "../shaders/pressure.frag";
import { MaterialProps } from "../../../types";
import { MATERIAL_BASIC_PARAMS } from "../../../../libs/constants";
import { createMaterialParameters } from "../../../../utils/createMaterialParameters";

export class PressureMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uPressure: { value: THREE.Texture };
      uDivergence: { value: THREE.Texture };
      texelSize: { value: THREE.Vector2 };
   };
}

export const usePressureMaterial = ({ onBeforeInit }: MaterialProps) => {
   const pressureMaterial = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         ...createMaterialParameters(
            {
               uniforms: {
                  uPressure: { value: null },
                  uDivergence: { value: null },
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

   return pressureMaterial as PressureMaterial;
};
