import * as THREE from "three";
import { DefaultUniforms, FxMaterial } from "./FxMaterial";
import { mergeUniforms } from "three/src/renderers/shaders/UniformsUtils.js";
import { RootState } from "../types";

export type BasicFxUniforms = {
   // mixSrc
   mixSrc: { value: THREE.Texture | null };
   mixSrcResolution: { value: THREE.Vector2 };
   mixSrcUv: { value: number };
   mixSrcAlpha: { value: number };
   mixSrcColor: { value: number };
   // mixDst
   mixDst: { value: THREE.Texture | null };
   mixDstResolution: { value: THREE.Vector2 };
   mixDstUv: { value: number };
   mixDstAlpha: { value: number };
   mixDstColor: { value: number };
} & DefaultUniforms;

export type BasicFxValues = {
   // mixSrc
   mixSrc?: THREE.Texture | null;
   mixSrcResolution?: THREE.Vector2;
   mixSrcUv?: number;
   mixSrcAlpha?: number;
   mixSrcColor?: number;
   //mixDst
   mixDst?: THREE.Texture | null;
   mixDstResolution?: THREE.Vector2;
   mixDstUv?: number;
   mixDstAlpha?: number;
   mixDstColor?: number;
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

   uniforms: BasicFxUniforms;

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
            mixSrcUv: { value: 0 },
            mixSrcAlpha: { value: 0 },
            mixSrcColor: { value: 0 },
            // mixDst
            mixDst: { value: null },
            mixDstResolution: { value: new THREE.Vector2() },
            mixDstUv: { value: 0 },
            mixDstAlpha: { value: 0 },
            mixDstColor: { value: 0 },
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

   update(rootState: RootState) {
      this.updateDefaultValues(rootState);
      this.updateBasicFx();
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
         this.version++; // to update material
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
      const { vertexShader: _vertex, fragmentShader: _fragment } =
         this.resolveDefaultShaders(
            vertexShader || this.vertexShaderCache,
            fragmentShader || this.fragmentShaderCache
         );
      this.vertexShaderCache = _vertex;
      this.fragmentShaderCache = _fragment;
      this.updateBasicFxShader();
   }
}

function filterEmptyLine(string: string) {
   return string !== "";
}
