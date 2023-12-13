import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { useMesh } from "./useMesh";
import { RootState, Size } from "@react-three/fiber";
import { useCamera } from "../../utils/useCamera";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { setUniform } from "../../utils/setUniforms";
import { useParams } from "../../utils/useParams";
import { HooksReturn } from "../types";

export type WaveParams = {
   /** -1.0 ~ 1.0 , default:vec2(0.0,0.0) */
   epicenter?: THREE.Vector2;
   /** 0.0 ~ 1.0 , default:0.0 */
   progress?: number;
   /** default:0.0 */
   width?: number;
   /** default:0.0 */
   strength?: number;
   /** default:center */
   mode?: "center" | "horizontal" | "vertical";
};

export type WaveObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
};

export const WAVE_PARAMS: WaveParams = {
   epicenter: new THREE.Vector2(0.0, 0.0),
   progress: 0.0,
   width: 0.0,
   strength: 0.0,
   mode: "center",
};

/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export const useWave = ({
   size,
   dpr,
}: {
   size: Size;
   dpr: number;
}): HooksReturn<WaveParams, WaveObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh({ scene, size, dpr });
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr,
      isSizeUpdate: true,
   });

   const [params, setParams] = useParams<WaveParams>(WAVE_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: WaveParams) => {
         const { gl } = props;

         updateParams && setParams(updateParams);

         setUniform(material, "uEpicenter", params.epicenter!);
         setUniform(material, "uProgress", params.progress!);
         setUniform(material, "uWidth", params.width!);
         setUniform(material, "uStrength", params.strength!);
         setUniform(
            material,
            "uMode",
            params.mode! === "center"
               ? 0
               : params.mode! === "horizontal"
               ? 1
               : 2
         );

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
