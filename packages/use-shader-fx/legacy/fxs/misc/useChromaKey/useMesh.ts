import { useMemo } from "react";
import * as THREE from "three";
import vertexShader from "./shader/main.vert";
import fragmentShader from "./shader/main.frag";
import { setUniform } from "../../../utils/setUniforms";
import { useResolution } from "../../../utils/useResolution";
import { useAddObject } from "../../../utils/useAddObject";
import { MaterialProps, Size } from "../../types";
import {
   MATERIAL_BASIC_PARAMS,
   DEFAULT_TEXTURE,
} from "../../../libs/constants";
import { CHROMAKEY_PARAMS } from ".";
import { createMaterialParameters } from "../../../utils/createMaterialParameters";

export class ChromaKeyMaterial extends THREE.ShaderMaterial {
   uniforms!: {
      u_texture: { value: THREE.Texture };
      u_resolution: { value: THREE.Vector2 };
      u_keyColor: { value: THREE.Color };
      u_similarity: { value: number };
      u_smoothness: { value: number };
      u_spill: { value: number };
      u_color: { value: THREE.Vector4 };
      u_contrast: { value: number };
      u_brightness: { value: number };
      u_gamma: { value: number };
   };
}

export const useMesh = ({
   scene,
   size,
   dpr,
   onBeforeInit,
}: {
   scene: THREE.Scene;
   size: Size;
   dpr: number | false;
} & MaterialProps) => {
   const geometry = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
   const material = useMemo(() => {
      const mat = new THREE.ShaderMaterial({
         ...createMaterialParameters(
            {
               uniforms: {
                  u_texture: { value: DEFAULT_TEXTURE },
                  u_resolution: { value: new THREE.Vector2() },
                  u_keyColor: { value: CHROMAKEY_PARAMS.color },
                  u_similarity: { value: CHROMAKEY_PARAMS.similarity },
                  u_smoothness: { value: CHROMAKEY_PARAMS.smoothness },
                  u_spill: { value: CHROMAKEY_PARAMS.spill },
                  u_color: { value: CHROMAKEY_PARAMS.color },
                  u_contrast: { value: CHROMAKEY_PARAMS.contrast },
                  u_brightness: { value: CHROMAKEY_PARAMS.brightness },
                  u_gamma: { value: CHROMAKEY_PARAMS.gamma },
               },
               vertexShader: vertexShader,
               fragmentShader: fragmentShader,
            },
            onBeforeInit
         ),
         ...MATERIAL_BASIC_PARAMS,
      });

      return mat;
   }, [onBeforeInit]) as ChromaKeyMaterial;

   const resolution = useResolution(size, dpr);
   setUniform(material)("u_resolution", resolution.clone());

   const mesh = useAddObject(scene, geometry, material, THREE.Mesh);

   return { material, mesh };
};
