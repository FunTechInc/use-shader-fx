import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { setUniform } from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
import { useParams } from "../../../utils/useParams";
import { getDpr } from "../../../utils/getDpr";

export type MarbleParams = {
   /** You can add random patterns to noise by passing random numbers ,default : `0` */
   pattern?: number;
   /** default : `2` */
   complexity?: number;
   /** default : `0.2` */
   complexityAttenuation?: number;
   /** default : `8` */
   iterations?: number;
   /** default : `0.2` */
   timeStrength?: number;
   /** default : `0.002` */
   scale?: number;
   /** you can get into the rhythm ♪ , default : `false` */
   beat?: number | false;
};

export type MarbleObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const MARBLE_PARAMS: MarbleParams = Object.freeze({
   pattern: 0,
   complexity: 2,
   complexityAttenuation: 0.2,
   iterations: 8,
   timeStrength: 0.2,
   scale: 0.002,
   beat: false,
});

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useMarble = ({
   size,
   dpr,
   samples,
   isSizeUpdate,
}: HooksProps): HooksReturn<MarbleParams, MarbleObject> => {
   const _dpr = getDpr(dpr);
   const scene = useMemo(() => new THREE.Scene(), []);
   const { material, mesh } = useMesh(scene);
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr: _dpr.fbo,
      samples,
      isSizeUpdate,
   });

   const [params, setParams] = useParams<MarbleParams>(MARBLE_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: MarbleParams) => {
         const { gl, clock } = props;
         updateParams && setParams(updateParams);

         setUniform(material, "u_pattern", params.pattern!);
         setUniform(material, "u_complexity", params.complexity!);
         setUniform(
            material,
            "u_complexityAttenuation",
            params.complexityAttenuation!
         );
         setUniform(material, "u_iterations", params.iterations!);
         setUniform(material, "u_timeStrength", params.timeStrength!);
         setUniform(material, "u_scale", params.scale!);

         setUniform(material, "u_time", params.beat || clock.getElapsedTime());

         return updateRenderTarget(gl);
      },
      [updateRenderTarget, material, setParams, params]
   );

   return [
      updateFx,
      setParams,
      {
         scene: scene,
         mesh: mesh,
         material: material,
         camera: camera,
         renderTarget: renderTarget,
         output: renderTarget.texture,
      },
   ];
};
