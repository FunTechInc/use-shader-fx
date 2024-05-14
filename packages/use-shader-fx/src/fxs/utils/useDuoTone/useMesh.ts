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
import { DUOTONE_PARAMS } from ".";
import { createMaterialParameters } from "../../../utils/createMaterialParameters";

export class DuoToneMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uTexture: { value: THREE.Texture };
      uColor0: { value: THREE.Color };
      uColor1: { value: THREE.Color };
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
                  uColor0: { value: DUOTONE_PARAMS.color0 },
                  uColor1: { value: DUOTONE_PARAMS.color1 },
               },
               vertexShader: vertexShader,
               fragmentShader: fragmentShader,
            },
            onBeforeInit
         ),
         ...MATERIAL_BASIC_PARAMS,
      });
      return mat;
   }, [onBeforeInit]) as DuoToneMaterial;
   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);
   return { material, mesh };
};
