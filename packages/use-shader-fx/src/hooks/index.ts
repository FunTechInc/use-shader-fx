import { useBlur, BlurProps } from "./useBlur";
import { useCoverTexture, CoverTextureProps } from "./useCoverTexture";
import { useFluid, FluidProps } from "./useFluid";
import { useNoise, NoiseProps } from "./useNoise";
import { useRawBlank, RawBlankProps } from "./useRawBlank";

export type FxTypes =
   | typeof useBlur
   | typeof useCoverTexture
   | typeof useFluid
   | typeof useNoise
   | typeof useRawBlank;

export type FxProps<T> = T extends typeof useBlur
   ? BlurProps
   : T extends typeof useCoverTexture
   ? CoverTextureProps
   : T extends typeof useNoise
   ? NoiseProps
   : T extends typeof useFluid
   ? FluidProps
   : T extends typeof useRawBlank
   ? RawBlankProps
   : never;

export * from "./useBlur";
export * from "./useCoverTexture";
export * from "./useFluid";
export * from "./useNoise";
export * from "./useRawBlank";
