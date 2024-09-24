import * as THREE from "three";
import { DefaultUniforms, FxMaterial } from "./FxMaterial";
import { mergeUniforms } from "three/src/renderers/shaders/UniformsUtils.js";

export type BasicFxUniforms = {
   // mixSrc
   mixSrc: { value: THREE.Texture | null };
   mixSrcResolution: { value: THREE.Vector2 };
   mixSrcUvFactor: { value: number };
   mixSrcAlphaFactor: { value: number };
   mixSrcColorFactor: { value: number };
   // mixDst
   mixDst: { value: THREE.Texture | null };
   mixDstResolution: { value: THREE.Vector2 };
   mixDstUvFactor: { value: number };
   mixDstAlphaFactor: { value: number };
   mixDstColorFactor: { value: number };
} & DefaultUniforms;

export type BasicFxValues = {
   // mixSrc
   mixSrc?: THREE.Texture | null;
   mixSrcResolution?: THREE.Vector2;
   mixSrcUvFactor?: number;
   mixSrcAlphaFactor?: number;
   mixSrcColorFactor?: number;
   //mixDst
   mixDst?: THREE.Texture | null;
   mixDstResolution?: THREE.Vector2;
   mixDstUvFactor?: number;
   mixDstAlphaFactor?: number;
   mixDstColorFactor?: number;
};

type FxBasicMaterialProps = {
   uniformValues?: BasicFxValues;
   parameters?: {};
   vertexShader?: string;
   fragmentShader?: string;
};

export class FxBasicFxMaterial extends FxMaterial {
   basicFx: {
      mixSrc: boolean;
      mixDst: boolean;
   };

   uniforms!: BasicFxUniforms;

   vertexShaderCache: string;
   vertexPrefixCache: string;
   fragmentShaderCache: string;
   fragmentPrefixCache: string;
   programCache: number;

   constructor({
      uniformValues,
      parameters = {},
      vertexShader,
      fragmentShader,
   }: FxBasicMaterialProps = {}) {
      super();

      this.basicFx = {
         mixSrc: uniformValues?.mixSrc ? true : false,
         mixDst: uniformValues?.mixDst ? true : false,
      };

      this.uniforms = mergeUniforms([
         this.uniforms,
         {
            // mixSrc
            mixSrc: { value: null },
            mixSrcResolution: { value: new THREE.Vector2() },
            mixSrcUvFactor: { value: 0 },
            mixSrcAlphaFactor: { value: 0 },
            mixSrcColorFactor: { value: 0 },
            // mixDst
            mixDst: { value: null },
            mixDstResolution: { value: new THREE.Vector2() },
            mixDstUvFactor: { value: 0 },
            mixDstAlphaFactor: { value: 0 },
            mixDstColorFactor: { value: 0 },
         } as BasicFxUniforms,
      ]) as BasicFxUniforms;

      this.setUniformValues(uniformValues);
      this.setValues(parameters);

      this.vertexShaderCache = this.vertexShader;
      this.fragmentShaderCache = this.fragmentShader;
      this.vertexPrefixCache = "";
      this.fragmentPrefixCache = "";
      this.programCache = 0;

      this.setupBasicFxShaders(vertexShader, fragmentShader);
   }

   updateBasicFx() {
      const _cache = this.programCache;

      const isMixSrc = this.uniforms.mixSrc.value ? true : false;
      const isMixDst = this.uniforms.mixDst.value ? true : false;

      const { mixSrc, mixDst } = this.basicFx;

      if (mixSrc !== isMixSrc) {
         this.basicFx.mixSrc = isMixSrc;
         this.programCache++;
      }

      if (mixDst !== isMixDst) {
         this.basicFx.mixDst = isMixDst;
         this.programCache++;
      }

      if (_cache !== this.programCache) {
         this.updateBasicFxPrefix();
         this.updateBasicFxShader();
         this.needsUpdate = true; // same as this.version++
      }
   }

   updateBasicFxPrefix() {
      const { mixSrc, mixDst } = this.basicFx;
      const prefixVertex = [
         mixSrc ? "#define USF_USE_MIXSRC" : "",
         mixDst ? "#define USF_USE_MIXDST" : "",
         "\n",
      ]
         .filter(filterEmptyLine)
         .join("\n");
      const prefixFragment = [
         mixSrc ? "#define USF_USE_MIXSRC" : "",
         mixDst ? "#define USF_USE_MIXDST" : "",
         "\n",
      ]
         .filter(filterEmptyLine)
         .join("\n");
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

function filterEmptyLine(string: string) {
   return string !== "";
}
