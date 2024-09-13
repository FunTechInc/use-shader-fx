import { useMemo } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddObject } from "../../../utils/useAddObject";
import { MaterialProps } from "../../types";
import {
   MATERIAL_BASIC_PARAMS,
   DEFAULT_TEXTURE,
} from "../../../libs/constants";
import { COSPALETTE_PARAMS } from ".";
import { createMaterialParameters } from "../../../utils/createMaterialParameters";

export class CosPaletteMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uTexture: { value: THREE.Texture };
      uRgbWeight: { value: THREE.Vector3 };
      uColor1: { value: THREE.Color };
      uColor2: { value: THREE.Color };
      uColor3: { value: THREE.Color };
      uColor4: { value: THREE.Color };
   };
}

export const useMesh = ({
   scene,
   onBeforeInit,
}: { scene: THREE.Scene } & MaterialProps) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         ...createMaterialParameters(
            {
               uniforms: {
                  uTexture: { value: DEFAULT_TEXTURE },
                  uRgbWeight: { value: COSPALETTE_PARAMS.rgbWeight },
                  uColor1: { value: COSPALETTE_PARAMS.color1 },
                  uColor2: { value: COSPALETTE_PARAMS.color2 },
                  uColor3: { value: COSPALETTE_PARAMS.color3 },
                  uColor4: { value: COSPALETTE_PARAMS.color4 },
               },
               vertexShader: vertexShader,
               fragmentShader: fragmentShader,
            },
            onBeforeInit
         ),
         ...MATERIAL_BASIC_PARAMS,
      });

      return mat;
   }, [onBeforeInit]) as CosPaletteMaterial;
   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);
   return { material, mesh };
};
