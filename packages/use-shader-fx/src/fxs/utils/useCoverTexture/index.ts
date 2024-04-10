import * as THREE from "three";
import { useCallback, useMemo } from "react";
import { useMesh } from "./useMesh";
import { useCamera } from "../../../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { setUniform } from "../../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../../types";
import { useParams } from "../../../utils/useParams";
import { getDpr } from "../../../utils/getDpr";

export type CoverTextureParams = {
   /** Textures that you want to display exactly on the screen , default : `THREE.Texture()` */
   texture?: THREE.Texture;
};

export type CoverTextureObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const COVERTEXTURE_PARAMS: CoverTextureParams = {
   texture: new THREE.Texture(),
};

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useCoverTexture = ({
   size,
   dpr,
   samples = 0,
}: HooksProps): HooksReturn<CoverTextureParams, CoverTextureObject> => {
   const _dpr = getDpr(dpr);

   const scene = useMemo(() => new THREE.Scene(), []);
   const { material, mesh } = useMesh({ scene, size, dpr: _dpr.shader });
   const camera = useCamera(size);
   const [renderTarget, updateRenderTarget] = useSingleFBO({
      scene,
      camera,
      dpr: _dpr.fbo,
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
         mesh: mesh,
         material: material,
         camera: camera,
         renderTarget: renderTarget,
         output: renderTarget.texture,
      },
   ];
};
