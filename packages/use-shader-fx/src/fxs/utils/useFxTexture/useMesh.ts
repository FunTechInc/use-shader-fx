import { useEffect, useMemo } from "react";
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
import { FXTEXTURE_PARAMS } from ".";

export class FxTextureMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uResolution: { value: THREE.Vector2 };
      uTextureResolution: { value: THREE.Vector2 };
      uTexture0: { value: THREE.Texture };
      uTexture1: { value: THREE.Texture };
      padding: { value: number };
      uMap: { value: THREE.Texture };
      edgeIntensity: { value: number };
      mapIntensity: { value: number };
      epicenter: { value: THREE.Vector2 };
      progress: { value: number };
      dirX: { value: number };
      dirY: { value: number };
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
            uTexture0: { value: DEFAULT_TEXTURE },
            uTexture1: { value: DEFAULT_TEXTURE },
            padding: { value: FXTEXTURE_PARAMS.padding },
            uMap: { value: DEFAULT_TEXTURE },
            edgeIntensity: { value: FXTEXTURE_PARAMS.edgeIntensity },
            mapIntensity: { value: FXTEXTURE_PARAMS.mapIntensity },
            epicenter: { value: FXTEXTURE_PARAMS.epicenter },
            progress: { value: FXTEXTURE_PARAMS.progress },
            dirX: { value: FXTEXTURE_PARAMS.dir?.x },
            dirY: { value: FXTEXTURE_PARAMS.dir?.y },
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
   }, [onBeforeCompile, uniforms]) as FxTextureMaterial;

   const resolution = useResolution(size, dpr);
   setUniform(material)("uResolution", resolution.clone());

   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);

   return { material, mesh };
};
