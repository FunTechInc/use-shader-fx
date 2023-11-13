import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../utils/useCamera";
import { useDoubleFBO } from "../../utils/useDoubleFBO";
import { useCallback, useMemo } from "react";
import { RootState, Size } from "@react-three/fiber";
import { usePointer } from "../../utils/usePointer";
import { setUniform } from "../../utils/setUniforms";
import { HooksReturn } from "../types";
import { useParams } from "../../utils/useParams";
import { DoubleRenderTarget } from "../../utils/types";

export type BrushParams = {
   /** ブラシに適用するテクスチャー.aの値でmixさせてます , default:THREE.Texture() */
   texture?: THREE.Texture;
   /** size of the stamp, percentage of the size ,default:0.05 */
   radius?: number;
   /** 滲み効果の強さ , default:0.0*/
   smudge?: number;
   /** 拡散率。1にすると残り続ける ,default:0.9 */
   dissipation?: number;
   /** モーションブラーの強さ , default:0.0 */
   motionBlur?: number;
   /** モーションブラーのサンプル数 これを高くするとパフォーマンスへの影響大, default: 5 */
   motionSample?: number;
   /** ブラシの色 , default:THREE.Color(0xffffff) */
   color?: THREE.Color;
};

export type BrushObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: DoubleRenderTarget;
};

export const BRUSH_PARAMS: BrushParams = {
   texture: new THREE.Texture(),
   radius: 0.05,
   smudge: 0.0,
   dissipation: 0.9,
   motionBlur: 0.0,
   motionSample: 5,
   color: new THREE.Color(0xffffff),
};

/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export const useBrush = ({
   size,
   dpr,
}: {
   size: Size;
   dpr: number;
}): HooksReturn<BrushParams, BrushObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh({ scene, size, dpr });
   const camera = useCamera(size);
   const updatePointer = usePointer();
   const [renderTarget, updateRenderTarget] = useDoubleFBO({
      scene,
      camera,
      size,
   });

   const [params, setParams] = useParams<BrushParams>(
      structuredClone(BRUSH_PARAMS)
   );

   const updateFx = useCallback(
      (props: RootState, updateParams?: BrushParams) => {
         const { gl, pointer } = props;

         updateParams && setParams(updateParams);

         setUniform(material, "uTexture", params.texture!);
         setUniform(material, "uRadius", params.radius!);
         setUniform(material, "uSmudge", params.smudge!);
         setUniform(material, "uDissipation", params.dissipation!);
         setUniform(material, "uMotionBlur", params.motionBlur!);
         setUniform(material, "uMotionSample", params.motionSample!);
         setUniform(material, "uColor", params.color!);

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
