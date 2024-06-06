import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Size } from "@react-three/fiber";
import { Utils } from "..";

export type ResizeBoundary = {
   /** Useful if you intentionally want to specify a higher resolution than `window.devicePixelRatio`. The maximum dpr is returned according to `GL_MAX_TEXTURE_SIZE`. */
   maxDpr: number;
   isUpdate: boolean;
};

const checkUpdate = (
   currentW: number,
   currentH: number,
   memoW: number,
   memoH: number,
   threshold: number,
   boundFor: "smaller" | "larger" | "both"
) => {
   const isSmaller =
      currentW < memoW - threshold || currentH < memoH - threshold;
   const isLarger =
      currentW > memoW + threshold || currentH > memoH + threshold;

   return (
      (boundFor === "smaller" && isSmaller) ||
      (boundFor === "larger" && isLarger) ||
      (boundFor === "both" && (isSmaller || isLarger))
   );
};

export const useResizeBoundary = ({
   gl,
   size,
   boundFor,
   threshold,
}: {
   gl: THREE.WebGLRenderer;
   size: Size;
   boundFor: "smaller" | "larger" | "both";
   threshold: number;
}) => {
   const memorizedSize = useRef<Size>(size);

   const resizeBoundary = useMemo<ResizeBoundary>(() => {
      const { width: currentW, height: currentH } = size;
      const { width: memoW, height: memoH } = memorizedSize.current;

      const isUpdate = checkUpdate(
         currentW,
         currentH,
         memoW,
         memoH,
         threshold,
         boundFor
      );
      const dpr = Utils.getMaxDpr(gl, size);

      if (isUpdate) {
         memorizedSize.current = size;
      }
      return {
         maxDpr: dpr,
         isUpdate,
      };
   }, [size, gl, boundFor, threshold]);

   return resizeBoundary;
};
