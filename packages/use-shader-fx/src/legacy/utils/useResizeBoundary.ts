import { useMemo, useRef } from "react";
import { Size } from "../fxs/types";

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
   size,
   boundFor,
   threshold,
}: {
   size: Size;
   boundFor: "smaller" | "larger" | "both";
   threshold: number;
}) => {
   const memorizedSize = useRef<Size>(size);

   const isBeyondBoundary = useMemo<boolean>(() => {
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

      if (isUpdate) {
         memorizedSize.current = size;
      }
      return isUpdate;
   }, [size, boundFor, threshold]);

   return isBeyondBoundary;
};
