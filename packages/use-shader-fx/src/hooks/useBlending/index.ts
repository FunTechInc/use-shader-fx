import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../utils/useCamera";
import { RootState, Size } from "@react-three/fiber";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { setUniform } from "../../utils/setUniforms";
import { HooksReturn } from "../types";
import { useParams } from "../../utils/useParams";

export type BlendingParams = {
   /** Make this texture Blending , default:THREE.Texture */
   texture?: THREE.Texture;
   /** map texture, default:THREE.Texture */
   map?: THREE.Texture;
   /** distortion strength , default:0.03 */
   distortionStrength?: number;
   /** value that reflects noise , default:0.0 */
   edge0?: number;
   /** value that reflects noise , default:0.9  */
   edge1?: number;
   /** dodge color , default: THREE.Color(0xffffff) */
   color?: THREE.Color;
};

export type BlendingObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
};

export const BLENDING_PARAMS: BlendingParams = {
   texture: new THREE.Texture(),
   map: new THREE.Texture(),
   distortionStrength: 0.3,
   edge0: 0.0,
   edge1: 0.9,
   color: new THREE.Color(0xffffff),
};

/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export const useBlending = ({
   size,
   dpr,
}: {
   size: Size;
   dpr: number;
}): HooksReturn<BlendingParams, BlendingObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh(scene);
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr,
   });

   const [params, setParams] = useParams<BlendingParams>(BLENDING_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: BlendingParams) => {
         const { gl, clock } = props;
         updateParams && setParams(updateParams);
         setUniform(material, "uTime", clock.getElapsedTime());
         setUniform(material, "uTexture", params.texture!);
         setUniform(material, "uMap", params.map!);
         setUniform(material, "distortionStrength", params.distortionStrength!);
         setUniform(material, "edge0", params.edge0!);
         setUniform(material, "edge1", params.edge1!);
         setUniform(material, "color", params.color!);
         const bufferTexture = updateRenderTarget(gl);
         return bufferTexture;
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
