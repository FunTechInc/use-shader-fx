import * as THREE from "three";
import { useMesh } from "./useMesh";
import { useCamera } from "../../utils/useCamera";
import { useCallback, useMemo } from "react";
import { RootState } from "@react-three/fiber";
import { usePointer } from "../../utils/usePointer";
import { setUniform } from "../../utils/setUniforms";
import { HooksProps, HooksReturn } from "../types";
import { useParams } from "../../utils/useParams";
import { DoubleRenderTarget, useDoubleFBO } from "../../utils/useDoubleFBO";

export type BrushParams = {
   /** Texture applied to the brush.Mixed with the value of a , default:THREE.Texture() */
   texture?: THREE.Texture;
   /** size of the stamp, percentage of the size ,default:0.05 */
   radius?: number;
   /** Strength of smudge effect , default:0.0*/
   smudge?: number;
   /** dissipation rate. If set to 1, it will remain. ,default:1.0 */
   dissipation?: number;
   /** Strength of motion blur , default:0.0 */
   motionBlur?: number;
   /** Number of motion blur samples. Affects performance default: 5 */
   motionSample?: number;
   /** brush color , default:THREE.Color(0xffffff) */
   color?: THREE.Color;
};

export type BrushObject = {
   scene: THREE.Scene;
   material: THREE.Material;
   camera: THREE.Camera;
   renderTarget: DoubleRenderTarget;
   output: THREE.Texture;
};

export const BRUSH_PARAMS: BrushParams = {
   texture: new THREE.Texture(),
   radius: 0.05,
   smudge: 0.0,
   dissipation: 1.0,
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
   samples = 0,
}: HooksProps): HooksReturn<BrushParams, BrushObject> => {
   const scene = useMemo(() => new THREE.Scene(), []);
   const material = useMesh({ scene, size, dpr });
   const camera = useCamera(size);
   const updatePointer = usePointer();
   const [renderTarget, updateRenderTarget] = useDoubleFBO({
      scene,
      camera,
      size,
      dpr,
      samples,
   });

   const [params, setParams] = useParams<BrushParams>(BRUSH_PARAMS);

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

         return updateRenderTarget(gl, ({ read }) => {
            setUniform(material, "uMap", read);
         });
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
         output: renderTarget.read.texture,
      },
   ];
};
