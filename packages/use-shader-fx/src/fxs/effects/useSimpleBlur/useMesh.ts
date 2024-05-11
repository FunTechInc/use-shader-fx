import { useMemo } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { useAddObject } from "../../../utils/useAddObject";
import { SIMPLEBLUR_PARAMS } from ".";
import { MaterialProps } from "../../types";
import {
   MATERIAL_BASIC_PARAMS,
   DEFAULT_TEXTURE,
} from "../../../libs/constants";
import { setOnBeforeCompile } from "../../../utils/setOnBeforeCompile";

export class SampleMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uTexture: { value: THREE.Texture };
      uResolution: { value: THREE.Vector2 };
      uBlurSize: { value: number };
   };
}

export const useMesh = ({
   scene,
   uniforms,
   onBeforeCompile,
}: { scene: THREE.Scene } & MaterialProps) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         uniforms: {
            uTexture: { value: DEFAULT_TEXTURE },
            uResolution: { value: new THREE.Vector2(0, 0) },
            uBlurSize: { value: SIMPLEBLUR_PARAMS.blurSize },
            ...uniforms,
         },
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
         ...MATERIAL_BASIC_PARAMS,
      });
      mat.onBeforeCompile = setOnBeforeCompile(onBeforeCompile);

      return mat;
   }, [onBeforeCompile, uniforms]) as SampleMaterial;

   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);

   return { material, mesh };
};
