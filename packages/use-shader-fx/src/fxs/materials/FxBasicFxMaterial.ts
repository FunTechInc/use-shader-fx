import { FxMaterial, FxMaterialProps } from "./FxMaterial";
import {
   BasicFxUniforms,
   BasicFxValues,
   BasicFxFlag,
   BasicFxLib,
} from "./BasicFxLib";

export class FxBasicFxMaterial extends FxMaterial {
   basicFxFlag: BasicFxFlag;

   uniforms!: BasicFxUniforms;

   vertexShaderCache: string;
   vertexPrefixCache: string;
   fragmentShaderCache: string;
   fragmentPrefixCache: string;
   programCache: number;

   constructor({
      uniformValues,
      materialParameters = {},
      uniforms,
      vertexShader,
      fragmentShader,
   }: FxMaterialProps<BasicFxValues> = {}) {
      super();

      this.basicFxFlag = BasicFxLib.setupDefaultFlag(uniformValues);

      this.uniforms = {
         ...this.uniforms,
         ...BasicFxLib.DEFAULT_BASICFX_VALUES,
         ...uniforms,
      } as BasicFxUniforms;

      this.setUniformValues(uniformValues);
      this.setValues(materialParameters);

      this.vertexShaderCache = this.vertexShader;
      this.fragmentShaderCache = this.fragmentShader;
      this.vertexPrefixCache = "";
      this.fragmentPrefixCache = "";
      this.programCache = 0;

      this.setupBasicFxShaders(vertexShader, fragmentShader);
   }

   updateBasicFx() {
      const _cache = this.programCache;

      const { validCount, updatedFlag } = BasicFxLib.handleUpdateBasicFx(
         this.uniforms,
         this.basicFxFlag
      );

      this.programCache += validCount;
      this.basicFxFlag = updatedFlag;

      if (_cache !== this.programCache) {
         this.updateBasicFxPrefix();
         this.updateBasicFxShader();
         this.needsUpdate = true; // same as this.version++
      }
   }

   updateBasicFxPrefix() {
      const { prefixVertex, prefixFragment } =
         BasicFxLib.handleUpdateBasicFxPrefix(this.basicFxFlag);
      this.vertexPrefixCache = prefixVertex;
      this.fragmentPrefixCache = prefixFragment;
   }

   updateBasicFxShader() {
      this.vertexShader = this.vertexPrefixCache + this.vertexShaderCache;
      this.fragmentShader = this.fragmentPrefixCache + this.fragmentShaderCache;
   }

   setupBasicFxShaders(vertexShader?: string, fragmentShader?: string) {
      this.updateBasicFxPrefix();
      this.resolveDefaultShaders(
         vertexShader || this.vertexShaderCache,
         fragmentShader || this.fragmentShaderCache
      );
      this.vertexShaderCache = this.vertexShader;
      this.fragmentShaderCache = this.fragmentShader;
      this.updateBasicFxShader();
   }
}
