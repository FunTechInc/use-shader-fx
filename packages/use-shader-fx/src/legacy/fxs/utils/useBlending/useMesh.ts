import { useMemo } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddObject } from "../../../utils/useAddObject";
import { MaterialProps } from "../../types";
import {
   DEFAULT_TEXTURE,
   MATERIAL_BASIC_PARAMS,
} from "../../../libs/constants";
import { BLENDING_PARAMS } from ".";
import { createMaterialParameters } from "../../../utils/createMaterialParameters";

export class BlendingMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      u_texture: { value: THREE.Texture };
      uMap: { value: THREE.Texture };
      u_alphaMap: { value: THREE.Texture };
      u_isAlphaMap: { value: boolean };
      uMapIntensity: { value: number };
      u_brightness: { value: THREE.Vector3 };
      u_min: { value: number };
      u_max: { value: number };
      u_dodgeColor: { value: THREE.Color };
      u_isDodgeColor: { value: boolean };
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
                  u_alphaMap: { value: DEFAULT_TEXTURE },
                  u_isAlphaMap: { value: false },
                  uMapIntensity: { value: BLENDING_PARAMS.mapIntensity },
                  u_brightness: { value: BLENDING_PARAMS.brightness },
                  u_min: { value: BLENDING_PARAMS.min },
                  u_max: { value: BLENDING_PARAMS.max },
                  u_dodgeColor: { value: new THREE.Color() },
                  u_isDodgeColor: { value: false },
               },
               vertexShader: vertexShader,
               fragmentShader: fragmentShader,
            },
            onBeforeInit
         ),
         ...MATERIAL_BASIC_PARAMS,
      });

      return mat;
   }, [onBeforeInit]) as BlendingMaterial;
   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);
   return { material, mesh };
};
