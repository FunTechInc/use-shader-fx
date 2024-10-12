import { useBlur } from "./useBlur";
import { useCoverTexture } from "./useCoverTexture";
import { useFluid } from "./useFluid";
import { useNoise } from "./useNoise";
import { useRawBlank } from "./useRawBlank";

export type FxTypes =
   | typeof useBlur
   | typeof useCoverTexture
   | typeof useFluid
   | typeof useNoise
   | typeof useRawBlank;

export { useBlur, useCoverTexture, useFluid, useNoise, useRawBlank };
