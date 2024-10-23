import * as THREE from "three";
import { fragment, vertex } from "./blur.glsl";
import { BasicFxMaterial } from "../../core/BasicFxMaterial";
import { FxMaterialProps } from "../../core/FxMaterial";
import { BasicFxUniforms, BasicFxValues } from "../../core/BasicFxLib";
import { NestUniformValues } from "../../../shaders/uniformsUtils";
import { TexturePipelineSrc } from "../../../misc";

type BlurUniforms = {
   /**  */
   src: { value: TexturePipelineSrc };
   /**  */
   blurSize: { value: number };
} & BasicFxUniforms;

export type BlurValues = NestUniformValues<BlurUniforms> & BasicFxValues;

export class BlurMaterial extends BasicFxMaterial {
   static get type() {
      return "BlurMaterial";
   }

   uniforms!: BlurUniforms;

   constructor({
      uniformValues,
      materialParameters = {},
   }: FxMaterialProps<BlurValues>) {
      super({
         vertexShader: vertex,
         fragmentShader: fragment,
         uniformValues,
         materialParameters,
         uniforms: {
            src: { value: null },
            blurSize: { value: 5 },
         } as BlurUniforms,
      });

      this.type = BlurMaterial.type;
   }
}
