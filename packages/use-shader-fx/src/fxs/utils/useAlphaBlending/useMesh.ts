import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useMemo } from "react";
import { Size } from "@react-three/fiber";
import { useAddObject } from "../../../utils/useAddObject";
import { MaterialProps } from "../../types";
import {
   DEFAULT_TEXTURE,
   MATERIAL_BASIC_PARAMS,
} from "../../../libs/constants";

export class AlphaBlendingMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uTexture: { value: THREE.Texture };
      uMap: { value: THREE.Texture };
   };
}

export const useMesh = ({
   scene,
   uniforms,
   onBeforeCompile,
}: {
   scene: THREE.Scene;
   size: Size;
} & MaterialProps) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         uniforms: {
            uTexture: { value: DEFAULT_TEXTURE },
            uMap: { value: DEFAULT_TEXTURE },
            ...uniforms,
         },
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
         ...MATERIAL_BASIC_PARAMS,
      });
      if (onBeforeCompile) {
         mat.onBeforeCompile = onBeforeCompile;
      }
      return mat;
   }, [onBeforeCompile, uniforms]) as AlphaBlendingMaterial;

   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);

   return { material, mesh };
};
