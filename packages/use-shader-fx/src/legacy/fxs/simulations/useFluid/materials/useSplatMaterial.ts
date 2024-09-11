import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/face.vert";
import fragmentShader from "../shaders/splat.frag";
import { MaterialProps } from "../../../types";
import {
   MATERIAL_BASIC_PARAMS,
   DEFAULT_TEXTURE,
} from "../../../../libs/constants";
import { createMaterialParameters } from "../../../../utils/createMaterialParameters";

export class SplatMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uTarget: { value: THREE.Texture };
      aspectRatio: { value: number };
      color: { value: THREE.Vector3 | THREE.Color };
      point: { value: THREE.Vector2 };
      radius: { value: number };
      texelSize: { value: THREE.Vector2 };
   };
}

export const useSplatMaterial = ({ onBeforeInit }: MaterialProps) => {
   const splatMaterial = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         ...createMaterialParameters(
            {
               uniforms: {
                  uTarget: { value: DEFAULT_TEXTURE },
                  aspectRatio: { value: 0 },
                  color: { value: new THREE.Vector3() },
                  point: { value: new THREE.Vector2() },
                  radius: { value: 0.0 },
                  texelSize: { value: new THREE.Vector2() },
               },
               vertexShader: vertexShader,
               fragmentShader: fragmentShader,
            },
            onBeforeInit
         ),
         // blending: THREE.AdditiveBlending,
         ...MATERIAL_BASIC_PARAMS,
      });

      return mat;
   }, [onBeforeInit]);

   return splatMaterial as SplatMaterial;
};
