import { Size } from "../fxs/types";
export declare const useResizeBoundary: ({ size, boundFor, threshold, }: {
    size: Size;
    boundFor: "smaller" | "larger" | "both";
    threshold: number;
}) => boolean;
