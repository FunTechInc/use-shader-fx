import * as THREE from "three";
import { useMemo } from "react";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddObject } from "../../../utils/useAddObject";
import { MaterialProps } from "../../types";
import {
   MATERIAL_BASIC_PARAMS,
   DEFAULT_TEXTURE,
} from "../../../libs/constants";
import { BRIGHTNESSPICKER_PARAMS } from ".";
import { createMaterialParameters } from "../../../utils/createMaterialParameters";

export class BrightnessPickerMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      u_texture: { value: THREE.Texture };
      u_brightness: { value: THREE.Vector3 };
      u_min: { value: number };
      u_max: { value: number };
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
                  u_brightness: { value: BRIGHTNESSPICKER_PARAMS.brightness },
                  u_min: { value: BRIGHTNESSPICKER_PARAMS.min },
                  u_max: { value: BRIGHTNESSPICKER_PARAMS.max },
               },
               vertexShader: vertexShader,
               fragmentShader: fragmentShader,
            },
            onBeforeInit
         ),
         ...MATERIAL_BASIC_PARAMS,
      });
      return mat;
   }, [onBeforeInit]) as BrightnessPickerMaterial;
   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);
   return { material, mesh };
};
