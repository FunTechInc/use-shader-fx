import { resolveIncludes } from "../libs/shaders/resolveShaders";
import { OnBeforeInitParameters } from "../fxs/types";

export const createMaterialParameters = (
   parameters: OnBeforeInitParameters,
   onBeforeInit?: (parameters: OnBeforeInitParameters) => void
) => {
   onBeforeInit && onBeforeInit(parameters);
   parameters.vertexShader = resolveIncludes(parameters.vertexShader);
   parameters.fragmentShader = resolveIncludes(parameters.fragmentShader);
   return parameters;
};
