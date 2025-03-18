import { useNoise, NoiseProps } from "./useNoise";

export type FxTypes = typeof useNoise;

export type FxProps<T> = T extends typeof useNoise ? NoiseProps : never;

export * from "./useNoise";
export * from "./useFluid";
export * from "./useBuffer";
export * from "./useRawBlank";
export * from "./useBlank";
export * from "./useGrid";
