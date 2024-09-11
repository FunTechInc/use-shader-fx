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
import { FXBLENDING_PARAMS } from ".";
import { createMaterialParameters } from "../../../utils/createMaterialParameters";

export class FxBlendingMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      u_texture: { value: THREE.Texture };
      uMap: { value: THREE.Texture };
      uMapIntensity: { value: number };
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
                  u_texture: { value: DEFAULT_TEXTURE },
                  uMap: { value: DEFAULT_TEXTURE },
                  uMapIntensity: { value: FXBLENDING_PARAMS.mapIntensity },
               },
               vertexShader: vertexShader,
               fragmentShader: fragmentShader,
            },
            onBeforeInit
         ),
         ...MATERIAL_BASIC_PARAMS,
      });
      return mat;
   }, [onBeforeInit]) as FxBlendingMaterial;

   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);
   return { material, mesh };
};
