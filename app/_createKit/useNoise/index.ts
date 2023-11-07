import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { RootState, Size } from "@react-three/fiber";
import {
   useCamera,
   useSingleFBO,
   setUniform,
   useParams,
} from "@/packages/use-shader-fx/src";
import { HooksReturn } from "@/packages/use-shader-fx/types/hooks/types";

export type NoiseParams = {
   /** 時間係数 default:0.3 */
   timeStrength: number;
   /** noiseの振幅回数 default:8 */
   noiseOctaves: number;
   /** fbmの振幅回数 default:3 */
   fbmOctaves: number;
};

export type NoiseObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
};

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

   const [params, setParams] = useParams<NoiseParams>({
      timeStrength: 0.0,
      noiseOctaves: 0,
      fbmOctaves: 0,
   });

   const updateFx = useCallback(
      (props: RootState, updateParams: NoiseParams) => {
         const { gl, clock } = props;

         setParams(updateParams);

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
