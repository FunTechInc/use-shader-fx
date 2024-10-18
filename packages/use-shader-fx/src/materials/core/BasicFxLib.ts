import * as THREE from "three";
import { DefaultUniforms } from "./FxMaterial";
import { TexturePipelineSrc } from "../../misc";

/*===============================================
basic fxを追加するときはこことShaderChunk,Libを編集する
===============================================*/
type BasicFxUniformsUnique = {
   // mixSrc
   mixSrc: { value: TexturePipelineSrc };
   mixSrcResolution: { value: THREE.Vector2 };
   mixSrcUvFactor: { value: number };
   mixSrcAlphaFactor: { value: number };
   mixSrcColorFactor: { value: number };
   // mixDst
   mixDst: { value: TexturePipelineSrc };
   mixDstResolution: { value: THREE.Vector2 };
   mixDstUvFactor: { value: number };
   mixDstAlphaFactor: { value: number };
   mixDstColorFactor: { value: number };
};
const DEFAULT_BASICFX_VALUES: BasicFxUniformsUnique = {
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
};

export type BasicFxUniforms = BasicFxUniformsUnique & DefaultUniforms;

export type ExtractUniformValue<T> = {
   [K in keyof T]?: T[K] extends { value: infer U } ? U : never;
};
export type BasicFxValues = ExtractUniformValue<BasicFxUniformsUnique>;

export type BasicFxFlag = {
   mixSrc: boolean;
   mixDst: boolean;
};

/** valuesのkeyにbasicFxが含まれているかどうかの判定 */
function containsBasicFxValues(values?: { [key: string]: any }): boolean {
   if (!values) return false;
   return Object.keys(values).some((key) =>
      Object.keys(DEFAULT_BASICFX_VALUES).includes(key as keyof BasicFxValues)
   );
}

function setupDefaultFlag(uniformValues?: BasicFxValues): BasicFxFlag {
   return {
      mixSrc: uniformValues?.mixSrc ? true : false,
      mixDst: uniformValues?.mixDst ? true : false,
   };
}

function handleUpdateBasicFx(
   uniforms: BasicFxUniforms,
   basicFxFlag: BasicFxFlag
): {
   validCount: number;
   updatedFlag: BasicFxFlag;
} {
   const isMixSrc = uniforms.mixSrc.value ? true : false;
   const isMixDst = uniforms.mixDst.value ? true : false;

   const { mixSrc, mixDst } = basicFxFlag;

   const updatedFlag = basicFxFlag;

   let validCount = 0;

   if (mixSrc !== isMixSrc) {
      updatedFlag.mixSrc = isMixSrc;
      validCount++;
   }

   if (mixDst !== isMixDst) {
      updatedFlag.mixDst = isMixDst;
      validCount++;
   }

   return {
      validCount,
      updatedFlag,
   };
}

function filterEmptyLine(string: string) {
   return string !== "";
}

const BASICFX_SHADER_PREFIX = {
   mixSrc: "#define USF_USE_MIXSRC",
   mixDst: "#define USF_USE_MIXDST",
};

function handleUpdateBasicFxPrefix(basicFxFlag: BasicFxFlag): {
   prefixVertex: string;
   prefixFragment: string;
} {
   const { mixSrc, mixDst } = basicFxFlag;
   const prefixVertex = [
      mixSrc ? BASICFX_SHADER_PREFIX.mixSrc : "",
      mixDst ? BASICFX_SHADER_PREFIX.mixDst : "",
      "\n",
   ]
      .filter(filterEmptyLine)
      .join("\n");
   const prefixFragment = [
      mixSrc ? BASICFX_SHADER_PREFIX.mixSrc : "",
      mixDst ? BASICFX_SHADER_PREFIX.mixDst : "",
      "\n",
   ]
      .filter(filterEmptyLine)
      .join("\n");

   return {
      prefixVertex,
      prefixFragment,
   };
}

export const BasicFxLib = {
   DEFAULT_BASICFX_VALUES,
   setupDefaultFlag,
   handleUpdateBasicFx,
   handleUpdateBasicFxPrefix,
   containsBasicFxValues,
};
