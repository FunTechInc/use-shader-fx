import { useMemo } from "react";
import * as THREE from "three";
import { useResolution } from "../../../utils/useResolution";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { setUniform } from "../../../utils/setUniforms";
import { Size } from "@react-three/fiber";
import { useAddObject } from "../../../utils/useAddObject";
import { MaterialProps } from "../../types";
import {
   MATERIAL_BASIC_PARAMS,
   DEFAULT_TEXTURE,
} from "../../../libs/constants";
import { setOnBeforeCompile } from "../../../utils/setOnBeforeCompile";

export class FxTextureMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uResolution: { value: THREE.Vector2 };
      uTextureResolution: { value: THREE.Vector2 };
      uTexture: { value: THREE.Texture };
   };
}

export const useMesh = ({
   scene,
   size,
   dpr,
   uniforms,
   onBeforeCompile,
}: {
   scene: THREE.Scene;
   size: Size;
   dpr: number | false;
} & MaterialProps) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         uniforms: {
            uResolution: { value: new THREE.Vector2() },
            uTextureResolution: { value: new THREE.Vector2() },
            uTexture: { value: DEFAULT_TEXTURE },
            ...uniforms,
         },
         vertexShader: vertexShader,
         fragmentShader: fragmentShader,
         ...MATERIAL_BASIC_PARAMS,
      });

      mat.onBeforeCompile = setOnBeforeCompile(onBeforeCompile);

      return mat;
   }, [onBeforeCompile, uniforms]) as FxTextureMaterial;

   const resolution = useResolution(size, dpr);
   setUniform(material)("uResolution", resolution.clone());

   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);

   return { material, mesh };
};
