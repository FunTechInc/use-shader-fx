import { Size } from "@react-three/fiber";
export declare const useResizeBoundary: ({ size, boundFor, threshold, }: {
    size: Size;
    boundFor: "smaller" | "larger" | "both";
    threshold: number;
}) => boolean;
