import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../utils/useCamera";
import { useDoubleFBO } from "../utils/useDoubleFBO";
import { useCallback, useMemo } from "react";
import { RootState, Size } from "@react-three/fiber";
import { usePointer } from "../utils/usePointer";
import { setUniform } from "../utils/setUniforms";
import { HooksReturn } from "../types";
import { useParams } from "../utils/useParams";
import { DoubleRenderTarget } from "../utils/types";

export type BrushParams = {
   /** ブラシに適用するテクスチャー */
   texture?: THREE.Texture;
   /** size of the stamp, percentage of the size */
   radius?: number;
   /** opacity TODO*これバグってるいので修正 */
   alpha?: number;
   /** 滲み効果の強さ */
   smudge?: number;
   /** 拡散率。1にすると残り続ける */
   dissipation?: number;
   /** 拡大率 */
   magnification?: number;
   /** モーションブラーの強さ */
   motionBlur?: number;
   /** モーションブラーのサンプル数 これを高くするとパフォーマンスへの影響大 */
   motionSample?: number;
};

export type BrushObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: DoubleRenderTarget;
};

export const useBrush = ({
   size,
}: {
   size: Size;
}): HooksReturn<BrushParams, BrushObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh({ scene, size });
   const camera = useCamera(size);
   const updatePointer = usePointer();
   const [renderTarget, updateRenderTarget] = useDoubleFBO({
      scene,
      camera,
      size,
   });

   const [params, setParams] = useParams<BrushParams>({
      texture: new THREE.Texture(),
      radius: 0.0,
      alpha: 0.0,
      smudge: 0.0,
      dissipation: 0.0,
      magnification: 0.0,
      motionBlur: 0.0,
      motionSample: 10,
   });

   const updateFx = useCallback(
      (props: RootState, updateParams: BrushParams) => {
         const { gl, pointer } = props;

         setParams(updateParams);

         setUniform(material, "uTexture", params.texture!);
         setUniform(material, "uRadius", params.radius!);
         setUniform(material, "uAlpha", params.alpha!);
         setUniform(material, "uSmudge", params.smudge!);
         setUniform(material, "uDissipation", params.dissipation!);
         setUniform(material, "uMagnification", params.magnification!);
         setUniform(material, "uMotionBlur", params.motionBlur!);
         setUniform(material, "uMotionSample", params.motionSample!);

         const { currentPointer, prevPointer, velocity } =
            updatePointer(pointer);
         setUniform(material, "uMouse", currentPointer);
         setUniform(material, "uPrevMouse", prevPointer);
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
