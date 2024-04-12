import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { RootState } from "@react-three/fiber";
import { useCamera } from "../../../utils/useCamera";
import { useSingleFBO } from "../../../utils/useSingleFBO";
import { setUniform } from "../../../utils/setUniforms";
import { useParams } from "../../../utils/useParams";
import { HooksProps, HooksReturn } from "../../types";
import { getDpr } from "../../../utils/getDpr";

export type CosPaletteParams = {
   /** color1, default : `rgb(50%, 50%, 50%)` */
   color1?: THREE.Color;
   /** color2, default : `rgb(50%, 50%, 50%)` */
   color2?: THREE.Color;
   /** color3, default : `rgb(100%, 100%, 100%)` */
   color3?: THREE.Color;
   /** color4, default : `rgb(0%, 10%, 20%)` */
   color4?: THREE.Color;
   /** texture to be used as a palette */
   texture?: THREE.Texture;
   /** weight of the rgb, default : `THREE.Vector3(1.0,0.0,0.0)` */
   rgbWeight?: THREE.Vector3;
};

export type ColorPaletteObject = {
   scene: THREE.Scene;
   mesh: THREE.Mesh;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
   output: THREE.Texture;
};

export const COSPALETTE_PARAMS: CosPaletteParams = Object.freeze({
   texture: new THREE.Texture(),
   color1: new THREE.Color().set(0.5, 0.5, 0.5),
   color2: new THREE.Color().set(0.5, 0.5, 0.5),
   color3: new THREE.Color().set(1, 1, 1),
   color4: new THREE.Color().set(0, 0.1, 0.2),
   rgbWeight: new THREE.Vector3(0.299, 0.587, 0.114),
});

/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export const useCosPalette = ({
   size,
   dpr,
   samples,
   isSizeUpdate,
}: HooksProps): HooksReturn<CosPaletteParams, ColorPaletteObject> => {
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

   const [params, setParams] = useParams<CosPaletteParams>(COSPALETTE_PARAMS);

   const updateFx = useCallback(
      (props: RootState, updateParams?: CosPaletteParams) => {
         const { gl } = props;

         updateParams && setParams(updateParams);

         setUniform(material, "uTexture", params.texture!);
         setUniform(material, "uColor1", params.color1!);
         setUniform(material, "uColor2", params.color2!);
         setUniform(material, "uColor3", params.color3!);
         setUniform(material, "uColor4", params.color4!);
         setUniform(material, "uRgbWeight", params.rgbWeight!);

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
