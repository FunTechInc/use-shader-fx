import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { setUniform } from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
import { useParams } from "../../../utils/useParams";

export type CoverTextureParams = {
   /** Textures that you want to display exactly on the screen , default:THREE.Texture()  */
   texture?: THREE.Texture;
};

export type CoverTextureObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const COVERTEXTURE_PARAMS: CoverTextureParams = {
   texture: new THREE.Texture(),
};

/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export const useCoverTexture = ({
   size,
   dpr,
   samples = 0,
}: HooksProps): HooksReturn<CoverTextureParams, CoverTextureObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh({ scene, size, dpr });
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      dpr,
      size,
      samples,
      isSizeUpdate: true,
   });

   const [params, setParams] =
      useParams<CoverTextureParams>(COVERTEXTURE_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: CoverTextureParams) => {
         const { gl } = props;

         updateParams && setParams(updateParams);

         setUniform(material, "uTexture", params.texture!);
         setUniform(material, "uTextureResolution", [
            params.texture!?.source?.data?.width || 0,
            params.texture!?.source?.data?.height || 0,
         ]);

         return updateRenderTarget(gl);
      },
      [updateRenderTarget, material, params, setParams]
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
