import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useMemo } from "react";
import { Size } from "@react-three/fiber";
import { useAddObject } from "../../../utils/useAddObject";
import { MaterialProps } from "../../types";
import {
   MATERIAL_BASIC_PARAMS,
   DEFAULT_TEXTURE,
} from "../../../libs/constants";
import { HSV_PARAMS } from ".";
import { setOnBeforeCompile } from "../../../utils/setOnBeforeCompile";

export class HSVMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      u_texture: { value: THREE.Texture };
      u_brightness: { value: number };
      u_saturation: { value: number };
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
            u_texture: { value: DEFAULT_TEXTURE },
            u_brightness: { value: HSV_PARAMS.brightness },
            u_saturation: { value: HSV_PARAMS.saturation },
            ...uniforms,
         },
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
         ...MATERIAL_BASIC_PARAMS,
      });

      mat.onBeforeCompile = setOnBeforeCompile(onBeforeCompile);

      return mat;
   }, [onBeforeCompile, uniforms]) as HSVMaterial;
   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);
   return { material, mesh };
};
