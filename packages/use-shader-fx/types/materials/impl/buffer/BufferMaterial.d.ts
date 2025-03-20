import { SamplingFxUniforms, SamplingFxValues, SamplingFxMaterial } from "../../core/SamplingFxMaterial";
import { FxMaterialProps } from "../../core/FxMaterial";
import { ExtractUniformValues, NestUniformValues } from "../../../shaders/uniformsUtils";
type BufferUniforms = SamplingFxUniforms;
export type BufferValues = NestUniformValues<BufferUniforms> & SamplingFxValues;
export type BufferMaterialProps = ExtractUniformValues<BufferUniforms>;
export declare class BufferMaterial extends SamplingFxMaterial {
    static readonly key: string;
    static get type(): string;
    uniforms: BufferUniforms;
    constructor(props?: FxMaterialProps<BufferValues>);
}
declare global {
    namespace JSX {
        interface IntrinsicElements {
            bufferMaterial: BufferMaterialProps & {
                ref?: React.RefObject<BufferMaterial>;
                key?: React.Key;
            };
        }
    }
}
export {};
