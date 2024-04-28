import { useMemo } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddObject } from "../../../utils/useAddObject";
import { BLANK_PARAMS } from ".";
import { MaterialProps } from "../../types";
import { Size } from "@react-three/fiber";
import { setUniform, useResolution } from "../../..";

export class BlankMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uTexture: { value: THREE.Texture };
      uBackbuffer: { value: THREE.Texture };
      uTime: { value: number };
      uPointer: { value: THREE.Vector2 };
      uResolution: { value: THREE.Vector2 };
   };
}
export const useMesh = ({
   scene,
   size,
   dpr,
   uniforms,
   onBeforeCompile,
}: { scene: THREE.Scene; size: Size; dpr: number | false } & MaterialProps) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         uniforms: {
            uTexture: { value: BLANK_PARAMS.texture },
            uBackbuffer: { value: new THREE.Texture() },
            uTime: { value: 0 },
            uPointer: { value: new THREE.Vector2() },
            uResolution: { value: new THREE.Vector2() },
            ...uniforms,
         },
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
      });
      if (onBeforeCompile) {
         mat.onBeforeCompile = onBeforeCompile;
      }
      return mat;
   }, [onBeforeCompile, uniforms]) as BlankMaterial;

   const resolution = useResolution(size, dpr);
   setUniform(material)("uResolution", resolution.clone());

   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);

   return { material, mesh };
};
