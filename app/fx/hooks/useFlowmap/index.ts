import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { DoubleRenderTarget, useDoubleFBO } from "../utils/useDoubleFBO";
import { useCallback, useMemo } from "react";
import { RootState } from "@react-three/fiber";
import { usePointer } from "../utils/usePointer";
import { setUniform } from "../utils/setUniforms";
import { HooksReturn } from "../types";
import { useParams } from "../utils/useParams";

export type FlowmapParams = {
   /** size of the stamp, percentage of the size */
   radius?: number;
   /** 拡大率 */
   magnification?: number;
   /** opacity */
   alpha?: number;
   /** 拡散率。1にすると残り続ける */
   dissipation?: number;
};

export type FlowmapObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: DoubleRenderTarget;
};

export const useFlowmap = (): HooksReturn<FlowmapParams, FlowmapObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh(scene);
   const camera = useCamera();
   const updatePointer = usePointer();
   const [renderTarget, updateRenderTarget] = useDoubleFBO(scene, camera);

   const [params, setParams] = useParams<FlowmapParams>({
      radius: 0.0,
      magnification: 0.0,
      alpha: 0.0,
      dissipation: 0.0,
   });

   const updateFx = useCallback(
      (props: RootState, updateParams: FlowmapParams) => {
         const { gl, pointer } = props;

         setParams(updateParams);

         setUniform(material, "uRadius", params.radius!);
         setUniform(material, "uAlpha", params.alpha!);
         setUniform(material, "uDissipation", params.dissipation!);
         setUniform(material, "uMagnification", params.magnification!);

         const { currentPointer, velocity } = updatePointer(pointer);
         setUniform(material, "uMouse", currentPointer);
         setUniform(material, "uVelocity", velocity);

         const bufferTexture = updateRenderTarget(gl, ({ read }) => {
            setUniform(material, "uMap", read);
         });

         return bufferTexture;
      },
      [material, updatePointer, updateRenderTarget, params, setParams]
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
