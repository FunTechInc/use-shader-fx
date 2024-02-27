/// <reference types="react" />
export type IsIntersecting = (index: number, once?: boolean) => boolean[] | boolean;
export declare const useIsIntersecting: () => {
    isIntersectingRef: import("react").MutableRefObject<boolean[]>;
    isIntersectingOnceRef: import("react").MutableRefObject<boolean[]>;
    isIntersecting: IsIntersecting;
};
