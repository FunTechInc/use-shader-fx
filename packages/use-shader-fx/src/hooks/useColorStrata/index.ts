import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../utils/useCamera";
import { RootState, Size } from "@react-three/fiber";
import { useSingleFBO } from "../../utils/useSingleFBO";
import { setUniform } from "../../utils/setUniforms";
import { HooksReturn } from "../types";
import { useParams } from "../../utils/useParams";

export type ColorStrataParams = {
   /** default: null */
   texture?: THREE.Texture | false;
   /** default: 1.0 */
   laminateLayer?: number;
   /** default: (0.1, 0.1) */
   laminateInterval?: THREE.Vector2;
   /** default: (1.0, 1.0) */
   laminateDetail?: THREE.Vector2;
   /** default: (0.0, 0.0) */
   distortion?: THREE.Vector2;
   /** default: (1.0, 1.0,1.0) */
   colorFactor?: THREE.Vector3;
};

export type ColorStrataObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
};

export const COLORSTRATA_PARAMS: ColorStrataParams = {
   texture: false,
   laminateLayer: 1.0,
   laminateInterval: new THREE.Vector2(0.1, 0.1),
   laminateDetail: new THREE.Vector2(1, 1),
   distortion: new THREE.Vector2(0, 0),
   colorFactor: new THREE.Vector3(1, 1, 1),
};

/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export const useColorStrata = ({
   size,
   dpr,
}: {
   size: Size;
   dpr: number;
}): HooksReturn<ColorStrataParams, ColorStrataObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh(scene);
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      size,
      dpr,
   });

   const [params, setParams] = useParams<ColorStrataParams>(COLORSTRATA_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: ColorStrataParams) => {
         const { gl } = props;
         updateParams && setParams(updateParams);

         if (params.texture) {
            setUniform(material, "uTexture", params.texture);
            setUniform(material, "isTexture", true);
         } else {
            setUniform(material, "isTexture", false);
         }

         setUniform(material, "laminateLayer", params.laminateLayer!);
         setUniform(material, "laminateInterval", params.laminateInterval!);
         setUniform(material, "laminateDetail", params.laminateDetail!);
         setUniform(material, "distortion", params.distortion!);
         setUniform(material, "colorFactor", params.colorFactor!);

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
