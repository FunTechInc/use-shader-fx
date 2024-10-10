import * as THREE from "three";
import { useCallback } from "react";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { HooksProps, HooksReturn } from "../types";
import { getDpr } from "../../utils/getDpr";
import { RootState } from "../types";
import { CoverTextureMaterial } from "./CoverTextureMaterial";
import { useFxScene } from "../../utils/useFxScene";
import { BasicFxValues } from "../../materials/core/BasicFxLib";

export type CoverTextureValues = {
   src?: THREE.Texture;
   textureResolution?: THREE.Vector2;
} & BasicFxValues;

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useCoverTexture = ({
   size,
   dpr,
   fboAutoSetSize,
   renderTargetOptions,
   materialParameters,
   ...uniformValues
}: HooksProps & CoverTextureValues): HooksReturn<
   CoverTextureValues,
   CoverTextureMaterial
> => {
   const _dpr = getDpr(dpr);

   const { scene, material, camera } = useFxScene({
      size,
      dpr: _dpr.shader,
      material: CoverTextureMaterial,
      uniformValues,
      materialParameters,
   });

   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr: _dpr.fbo,
      fboAutoSetSize,
      ...renderTargetOptions,
   });

   const setValues = useCallback(
      (newValues: CoverTextureValues) => {
         material.setUniformValues(newValues);
      },
      [material]
   );

   const render = useCallback(
      (rootState: RootState, newValues?: CoverTextureValues) => {
         const { gl } = rootState;
         newValues && setValues(newValues);

         material.updateBasicFx();

         return updateRenderTarget({ gl });
      },
      [setValues, updateRenderTarget, material]
   );

   return {
      render,
      setValues,
      texture: renderTarget.texture,
      material,
      scene,
      camera,
      renderTarget,
   };
};
