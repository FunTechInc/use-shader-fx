import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { RootState } from "@react-three/fiber";
import { useSingleFBO } from "../utils/useSingleFBO";
import { setUniform } from "../utils/setUniforms";
import { HooksReturn } from "../types";
import { useParams } from "../utils/useParams";

export type DuoToneParams = {
   texture?: THREE.Texture;
   color0?: THREE.Color;
   color1?: THREE.Color;
};

export type DuoToneObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: THREE.WebGLRenderTarget;
};

export const useDuoTone = (): HooksReturn<DuoToneParams, DuoToneObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh(scene);
   const camera = useCamera();
   const [renderTarget, updateRenderTarget] = useSingleFBO(scene, camera);

   const [params, setParams] = useParams<DuoToneParams>({
      texture: new THREE.Texture(),
      color0: new THREE.Color(0xffffff),
      color1: new THREE.Color(0x000000),
   });

   const updateFx = useCallback(
      (props: RootState, updateParams: DuoToneParams) => {
         const { gl } = props;

         setParams(updateParams);

         setUniform(material, "uTexture", params.texture!);
         setUniform(material, "uColor0", params.color0!);
         setUniform(material, "uColor1", params.color1!);

         const bufferTexture = updateRenderTarget(gl);

         return bufferTexture;
      },
      [updateRenderTarget, material, setParams, params]
   );

   return {
      updateFx,
      setParams,
      fxObject: {
         scene: scene,
         material: material,
         camera: camera,
         renderTarget: renderTarget,
      },
   };
};
