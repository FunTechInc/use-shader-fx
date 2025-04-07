/** merge shader codes */
export declare function mergeShaderCode(prefix: string[]): string;
export type ShaderLibType = "default" | "basicFx" | "samplingFx";
/**
 * merge ShaderLib to shader
 * basicFx_fragment_begin, basicFx_fragment_endは含まない。これらは各FXでカスタマイズする必要があるため。
 */
export declare function mergeShaderLib(vertexShader: string | undefined, fragmentShader: string | undefined, type: ShaderLibType): [string | undefined, string | undefined];
/** Resolve Includes */
export declare function resolveIncludes(string: string): string;
