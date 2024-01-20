import { useEffect, useRef } from "react";

export type UseDomViewProps = {
   onView?: () => void;
   onHidden?: () => void;
};

export type UseDomView = (props: UseDomViewProps) => void;

export const createUseDomView = (
   isIntersectingRef: React.MutableRefObject<boolean[]>
): UseDomView => {
   const useDomView = ({ onView, onHidden }: UseDomViewProps) => {
      const isView = useRef<boolean>(false);
      useEffect(() => {
         let id: number;
         const filterIntersection = () => {
            if (isIntersectingRef.current.some((item) => item)) {
               if (!isView.current) {
                  onView && onView();
                  isView.current = true;
               }
            } else {
               if (isView.current) {
                  onHidden && onHidden();
                  isView.current = false;
               }
            }
            id = requestAnimationFrame(filterIntersection);
         };
         id = requestAnimationFrame(filterIntersection);
         return () => {
            cancelAnimationFrame(id);
         };
      }, [onView, onHidden]);
   };
   return useDomView;
};
