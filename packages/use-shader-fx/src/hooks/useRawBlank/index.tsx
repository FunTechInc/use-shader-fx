import { useCallback } from "react";
import { useSingleFBO, getDpr, useSetup } from "../../utils";
import { HooksProps, HooksReturn, RootState } from "../types";
import { RawBlankMaterial } from "../../materials";
import { ShaderWithUniforms } from "../../shaders/uniformsUtils";

export type RawBlankProps = HooksProps & ShaderWithUniforms;

/**
 * type DefaultUniforms = {
   resolution: { value: THREE.Vector2 };
   texelSize: { value: THREE.Vector2 };
   aspectRatio: { value: number };
   maxAspect: { value: THREE.Vector2 };
   renderCount: { value: number };
	はデフォルトである
	あとvaringでvUvつかえる
	
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useRawBlank = ({
   size,
   dpr,
   fboAutoSetSize,
   renderTargetOptions,
   materialParameters,
   ...shaderWithUniforms
}: RawBlankProps): HooksReturn<{}, RawBlankMaterial> => {
   const _dpr = getDpr(dpr);

   const { scene, material, camera } = useSetup({
      size,
      dpr: _dpr.shader,
      material: RawBlankMaterial,
      materialParameters,
      ...shaderWithUniforms,
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
      (newValues: {}) => {
         material.setUniformValues(newValues);
      },
      [material]
   );

   const render = useCallback(
      (rootState: RootState, newValues?: {}) => {
         const { gl } = rootState;
         newValues && setValues(newValues);
         return updateRenderTarget({ gl });
      },
      [setValues, updateRenderTarget]
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
