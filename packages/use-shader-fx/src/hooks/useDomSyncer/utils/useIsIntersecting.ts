import { useRef } from "react";

export type IsIntersecting = (
   index: number,
   once?: boolean
) => boolean[] | boolean;

export const useIsIntersecting = () => {
   const isIntersectingRef = useRef<boolean[]>([]);
   const isIntersectingOnceRef = useRef<boolean[]>([]);
   const isIntersecting: IsIntersecting = (index, once = false) => {
      isIntersectingRef.current.forEach((value, i) => {
         if (value) {
            isIntersectingOnceRef.current[i] = true;
         }
      });
      const temp = once
         ? [...isIntersectingOnceRef.current]
         : [...isIntersectingRef.current];
      return index < 0 ? temp : temp[index];
   };

   return {
      isIntersectingRef,
      isIntersectingOnceRef,
      isIntersecting,
   };
};
