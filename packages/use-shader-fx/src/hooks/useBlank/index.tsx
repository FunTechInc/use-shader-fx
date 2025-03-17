import { useCallback } from "react";
import {
   useSingleFBO,
   getDpr,
   useSetup,
   useDoubleFBO,
   useMutableState,
} from "../../utils";
import { HooksProps, HooksReturn, RootState } from "../types";
import { BlankMaterial } from "../../materials";
import { ShaderWithUniforms } from "../../shaders/uniformsUtils";

type BlankConfig = {
   pointerLerp?: number;
};

export type BlankProps = HooksProps & ShaderWithUniforms;

/**
 * type DefaultUniforms = {
   resolution: { value: THREE.Vector2 };
   texelSize: { value: THREE.Vector2 };
   aspectRatio: { value: number };
   maxAspect: { value: THREE.Vector2 };
   renderCount: { value: number };
	はデフォルトである
	あとvaringでvUvつかえる

	加えて、
	time
	pointer
	backbuffer
	もデフォルトで使える

	あと、pointerLerp使えるよ

 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useBlank = ({
   size,
   dpr,
   fboAutoSetSize,
   renderTargetOptions,
   materialParameters,
   pointerLerp = 1,
   ...shaderWithUniforms
}: BlankProps & BlankConfig): HooksReturn<{}, BlankMaterial> => {
   const _dpr = getDpr(dpr);

   const { scene, material, camera } = useSetup({
      size,
      dpr: _dpr.shader,
      material: BlankMaterial,
      materialParameters,
      ...shaderWithUniforms,
   });

   const fboParams = {
      scene,
      camera,
      size,
      dpr: _dpr.fbo,
      fboAutoSetSize,
      ...renderTargetOptions,
   };
   const [renderTarget, updateRenderTarget] = useSingleFBO(fboParams);
   const [_, updateBackbuffer] = useDoubleFBO(fboParams);

   const [confing, setConfig] = useMutableState<BlankConfig>({ pointerLerp });

   const setValues = useCallback(
      ({ pointerLerp, ...newValues }: {} & BlankConfig) => {
         material.setUniformValues(newValues);
         if (pointerLerp) setConfig({ pointerLerp });
      },
      [material, setConfig]
   );

   const render = useCallback(
      (rootState: RootState, newValues?: {} & BlankConfig) => {
         const { gl, clock, pointer } = rootState;
         if (newValues) setValues(newValues);
         material.uniforms.time.value = clock.getElapsedTime();
         material.uniforms.pointer.value.lerp(
            pointer,
            confing.current.pointerLerp!
         );
         updateBackbuffer(
            { gl },
            ({ read }) => (material.uniforms.backbuffer.value = read)
         );
         return updateRenderTarget({ gl });
      },
      [setValues, updateRenderTarget, material, updateBackbuffer, confing]
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
