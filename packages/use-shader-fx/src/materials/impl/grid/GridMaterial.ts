import * as THREE from "three";
import {
   SamplingFxUniforms,
   SamplingFxValues,
   SamplingFxMaterial,
} from "../../core/SamplingFxMaterial";
import { FxMaterialProps } from "../../core/FxMaterial";
import {
   ExtractUniformValues,
   NestUniformValues,
   UniformParentKey,
} from "../../../shaders/uniformsUtils";
import { gridVertex, gridFragment } from "./grid.glsl";

type GridUniforms = {
   /** グリッドのマス数 */
   count: { value: THREE.Vector2 };
   /** 自動で画面のアスペクト比に合わせて正方形にscaleする */
   autoScale: { value: boolean };
   /** tick */
   tick: { value: number };
   shuffle: { value: UniformParentKey };
   shuffle_frequency: { value: number };
   shuffle_range: { value: number };
   /** スプライトテクスチャ */
   sprite: { value: UniformParentKey };
   sprite_src: { value: THREE.Texture };
   sprite_length: { value: number };
   sprite_shuffleSpeed: { value: number };
} & SamplingFxUniforms;

export type GridValues = NestUniformValues<GridUniforms> & SamplingFxValues;

export type GridMaterialProps = ExtractUniformValues<GridUniforms>;

export class GridMaterial extends SamplingFxMaterial {
   static get type() {
      return "GridMaterial";
   }

   uniforms!: GridUniforms;

   constructor({
      uniformValues,
      materialParameters = {},
   }: FxMaterialProps<GridValues>) {
      super({
         uniformValues,
         materialParameters,
         vertexShader: gridVertex,
         fragmentShader: gridFragment,
         uniforms: {
            count: { value: new THREE.Vector2(20, 20) },
            autoScale: { value: true },
            tick: { value: 0 },
            shuffle: { value: false },
            shuffle_frequency: { value: 5 },
            shuffle_range: { value: 2 },
            sprite: { value: false },
            sprite_src: { value: new THREE.Texture() },
            sprite_length: { value: 10 },
            sprite_shuffleSpeed: { value: 0 },
         } as GridUniforms,
      });

      this.setNearestFilter();

      this.type = GridMaterial.type;
   }

   /** When gridding with floor, you must use NearestFilter. */
   public setNearestFilter() {
      this.uniforms.texture_src.value.magFilter = THREE.NearestFilter;
      this.uniforms.texture_src.value.minFilter = THREE.NearestFilter;
      this.uniforms.sprite_src.value.magFilter = THREE.NearestFilter;
      this.uniforms.sprite_src.value.minFilter = THREE.NearestFilter;
   }
}
