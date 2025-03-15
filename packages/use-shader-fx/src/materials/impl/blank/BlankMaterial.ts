import * as THREE from "three";
import {
   DefaultUniforms,
   FxMaterial,
   FxMaterialProps,
} from "../../core/FxMaterial";
import { mergeShaderCode } from "../../../shaders/shaderUtils";

type BlankUniforms = {
   time: { value: number };
   pointer: { value: THREE.Vector2 };
   backbuffer: { value: THREE.Texture };
} & DefaultUniforms;

const SHADER_PARS = `
	uniform float time;
	uniform vec2 pointer;
	uniform sampler2D backbuffer;
`;

export class BlankMaterial extends FxMaterial {
   static get type() {
      return "BlankMaterial";
   }

   uniforms!: BlankUniforms;

   constructor({
      uniforms,
      vertexShader,
      fragmentShader,
      ...rest
   }: FxMaterialProps) {
      super({
         ...rest,
         vertexShader:
            vertexShader && mergeShaderCode([SHADER_PARS, vertexShader]),
         fragmentShader:
            fragmentShader && mergeShaderCode([SHADER_PARS, fragmentShader]),
         uniforms: {
            time: { value: 0.0 },
            pointer: { value: new THREE.Vector2() },
            backbuffer: { value: new THREE.Texture() },
            ...uniforms,
         } as BlankUniforms,
      });
      this.type = BlankMaterial.type;
   }
}
