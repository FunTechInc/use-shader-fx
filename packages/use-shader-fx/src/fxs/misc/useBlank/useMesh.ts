import { useMemo } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddObject } from "../../../utils/useAddObject";
import { BLANK_PARAMS } from ".";
import { MaterialProps } from "../../types";
import { Size } from "@react-three/fiber";
import { setUniform, useResolution } from "../../..";
import {
   MATERIAL_BASIC_PARAMS,
   DEFAULT_TEXTURE,
} from "../../../libs/constants";

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
            uTexture: { value: DEFAULT_TEXTURE },
            uBackbuffer: { value: DEFAULT_TEXTURE },
            uTime: { value: 0 },
            uPointer: { value: new THREE.Vector2() },
            uResolution: { value: new THREE.Vector2() },
            ...uniforms,
         },
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
         ...MATERIAL_BASIC_PARAMS,
      });
      mat.onBeforeCompile = (shader, renderer) => {
         onBeforeCompile && onBeforeCompile(shader, renderer);
         shader.fragmentShader = shader.fragmentShader.replace(
            /#usf[^\n]*\n/g,
            ""
         );
         shader.vertexShader = shader.vertexShader.replace(/#usf[^\n]*\n/g, "");
      };
      return mat;
   }, [onBeforeCompile, uniforms]) as BlankMaterial;

   const resolution = useResolution(size, dpr);
   setUniform(material)("uResolution", resolution.clone());

   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);

   return { material, mesh };
};
