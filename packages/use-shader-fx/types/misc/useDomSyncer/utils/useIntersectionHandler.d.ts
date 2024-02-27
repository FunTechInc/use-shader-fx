import { DomSyncerParams } from "..";
export declare const useIntersectionHandler: () => ({ isIntersectingRef, isIntersectingOnceRef, params, }: {
    isIntersectingRef: React.MutableRefObject<boolean[]>;
    isIntersectingOnceRef: React.MutableRefObject<boolean[]>;
    params: DomSyncerParams;
}) => void;
