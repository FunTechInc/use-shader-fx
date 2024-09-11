import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "../shaders/face.vert";
import fragmentShader from "../shaders/clear.frag";
import { MaterialProps } from "../../../types";
import {
   MATERIAL_BASIC_PARAMS,
   DEFAULT_TEXTURE,
} from "../../../../libs/constants";
import { createMaterialParameters } from "../../../../utils/createMaterialParameters";

export class ClearMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uTexture: { value: THREE.Texture };
      value: { value: number };
      texelSize: { value: THREE.Vector2 };
   };
}

export const useClearMaterial = ({ onBeforeInit }: MaterialProps) => {
   const advectionMaterial = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         ...createMaterialParameters(
            {
               uniforms: {
                  uTexture: { value: DEFAULT_TEXTURE },
                  value: { value: 0.0 },
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

   return advectionMaterial as ClearMaterial;
};
