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
import { COLORSTRATA_PARAMS } from ".";

export class ColorStrataMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      uTexture: { value: THREE.Texture };
      isTexture: { value: boolean };
      scale: { value: number };
      noise: { value: THREE.Texture };
      noiseStrength: { value: THREE.Vector2 };
      isNoise: { value: boolean };
      laminateLayer: { value: number };
      laminateInterval: { value: THREE.Vector2 };
      laminateDetail: { value: THREE.Vector2 };
      distortion: { value: THREE.Vector2 };
      colorFactor: { value: THREE.Vector3 };
      uTime: { value: number };
      timeStrength: { value: THREE.Vector2 };
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
            isTexture: { value: false },
            scale: { value: COLORSTRATA_PARAMS.scale },
            noise: { value: DEFAULT_TEXTURE },
            noiseStrength: { value: COLORSTRATA_PARAMS.noiseStrength },
            isNoise: { value: false },
            laminateLayer: { value: COLORSTRATA_PARAMS.laminateLayer },
            laminateInterval: { value: COLORSTRATA_PARAMS.laminateInterval },
            laminateDetail: { value: COLORSTRATA_PARAMS.laminateDetail },
            distortion: { value: COLORSTRATA_PARAMS.distortion },
            colorFactor: { value: COLORSTRATA_PARAMS.colorFactor },
            uTime: { value: 0 },
            timeStrength: { value: COLORSTRATA_PARAMS.timeStrength },
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
   }, [onBeforeCompile, uniforms]) as ColorStrataMaterial;

   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);

   return { material, mesh };
};
