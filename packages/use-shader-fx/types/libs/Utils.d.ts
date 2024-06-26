type Utils = {
    interpolate: (startValue: number, endValue: number, progress: number, threshold?: number) => number;
    smoothstep: (edge0: number, edge1: number, x: number) => number;
};
export declare const Utils: Utils;
export {};
