import { useRef } from "react";
import { DomSyncerParams } from "..";

export const useIntersectionHandler = () => {
   const intersectionObserverRef = useRef<IntersectionObserver[]>([]);
   const intersectionDomRef = useRef<(HTMLElement | Element | null)[]>([]);

   const intersectionHandler = ({
      isIntersectingRef,
      isIntersectingOnceRef,
      params,
   }: {
      isIntersectingRef: React.MutableRefObject<boolean[]>;
      isIntersectingOnceRef: React.MutableRefObject<boolean[]>;
      params: DomSyncerParams;
   }) => {
      if (intersectionObserverRef.current.length > 0) {
         intersectionObserverRef.current.forEach((observer, i) => {
            observer.unobserve(intersectionDomRef.current[i]!);
         });
      }

      intersectionDomRef.current = [];
      intersectionObserverRef.current = [];

      const newArr = new Array(params.dom!.length).fill(false);
      isIntersectingRef.current = [...newArr];
      isIntersectingOnceRef.current = [...newArr];

      params.dom!.forEach((dom, i) => {
         const callback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
               isIntersectingRef.current[i] = entry.isIntersecting;
            });
         };
         const observer = new IntersectionObserver(callback, {
            rootMargin: "0px",
            threshold: 0,
         });
         observer.observe(dom!);
         intersectionObserverRef.current.push(observer);
         intersectionDomRef.current.push(dom!);
      });
   };

   return intersectionHandler;
};
