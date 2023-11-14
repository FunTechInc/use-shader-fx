import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { RootState, Size } from "@react-three/fiber";
import { useCamera } from "../../utils/useCamera";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { setUniform } from "../../utils/setUniforms";
import { useParams } from "../../utils/useParams";
import { HooksReturn } from "../types";

export type NoiseParams = {
   /** time factor default:0.3 */
   timeStrength?: number;
   /** noiseOctaves, affects performance default:8 */
   noiseOctaves?: number;
   /** fbmOctaves, affects performance default:3 */
   fbmOctaves?: number;
};

export type NoiseObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
};

export const NOISE_PARAMS: NoiseParams = {
   timeStrength: 0.3,
   noiseOctaves: 8,
   fbmOctaves: 3,
};

/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export const useNoise = ({
   size,
   dpr,
}: {
   size: Size;
   dpr: number;
}): HooksReturn<NoiseParams, NoiseObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh(scene);
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr,
   });

   const [params, setParams] = useParams<NoiseParams>(NOISE_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: NoiseParams) => {
         const { gl, clock } = props;

         updateParams && setParams(updateParams);

         setUniform(material, "timeStrength", params.timeStrength!);
         setUniform(material, "noiseOctaves", params.noiseOctaves!);
         setUniform(material, "fbmOctaves", params.fbmOctaves!);

         setUniform(material, "uTime", clock.getElapsedTime());

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
      },
   ];
};
