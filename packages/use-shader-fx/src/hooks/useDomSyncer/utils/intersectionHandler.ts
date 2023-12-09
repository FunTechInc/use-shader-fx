import { DomSyncerParams } from "../";

export const intersectionHandler = ({
   intersectionObserverRef,
   intersectionDomRef,
   isIntersectingRef,
   params,
}: {
   intersectionObserverRef: React.MutableRefObject<IntersectionObserver[]>;
   intersectionDomRef: React.MutableRefObject<(HTMLElement | Element | null)[]>;
   isIntersectingRef: React.MutableRefObject<boolean[]>;
   params: DomSyncerParams;
}) => {
   if (intersectionObserverRef.current.length > 0) {
      intersectionObserverRef.current.forEach((observer, i) => {
         observer.unobserve(intersectionDomRef.current[i]!);
      });
   }

   intersectionDomRef.current = [];
   intersectionObserverRef.current = [];

   isIntersectingRef.current = new Array(params.dom.length).fill(false);

   params.dom.forEach((dom, i) => {
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
