import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { setUniform } from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
import { useParams } from "../../../utils/useParams";

export type MarbleParams = {
   pattern?: number;
   complexity?: number;
   complexityAttenuation?: number;
   iterations?: number;
   timeStrength?: number;
   scale?: number;
   /** you can get into the rhythm ♪ , default:null */
   beat?: number | null;
};

export type MarbleObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const MARBLE_PARAMS: MarbleParams = {
   pattern: 0,
   complexity: 2,
   complexityAttenuation: 0.2,
   iterations: 8,
   timeStrength: 0.2,
   scale: 0.002,
   beat: null,
};

/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export const useMarble = ({
   size,
   dpr,
   samples = 0,
}: HooksProps): HooksReturn<MarbleParams, MarbleObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh(scene);
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr,
      samples,
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

         setUniform(material, "u_time", params.beat ?? clock.getElapsedTime());

         return updateRenderTarget(gl);
      },
      [updateRenderTarget, material, setParams, params]
   );

   return [
      updateFx,
      setParams,
      {
         scene: scene,
         material: material,
         camera: camera,
         renderTarget: renderTarget,
         output: renderTarget.texture,
      },
   ];
};
