import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import { DEFAULT_TEXTURE } from "../../../libs/constants";

export class DivergenceNodeMaterial extends THREE.NodeMaterial {
   static get type() {
      return "DivergenceNodeMaterial";
   }

   velocity: THREE.Texture;
   texelSize: THREE.Vector2;

   constructor(parameters = {}) {
      super();

      this.velocity = DEFAULT_TEXTURE;
      this.texelSize = new THREE.Vector2(0);

      this.setValues(parameters);
   }

   setup(builder: any) {
      this.setupShaders();

      super.setup(builder);
   }

   setupShaders() {
      const { uv, Fn, texture, vec4, vec2, float, varying, clamp, select } =
         TSL;
      this.vertexNode = TSL.vec4(TSL.positionGeometry, 1);

      const vL = varying(uv().sub(vec2(this.texelSize.x, 0)));
      const vR = varying(uv().add(vec2(this.texelSize.x, 0)));
      const vT = varying(uv().add(vec2(0, this.texelSize.y)));
      const vB = varying(uv().sub(vec2(0, this.texelSize.y)));

      const sampleVelocity = Fn(({ uv }: { uv: any }) => {
         const clampedUV = vec2(clamp(uv, 0, 1)).toVar();
         const multiplier = vec2(1).toVar();
         multiplier.x.assign(
            select(uv.x.lessThan(0).or(uv.x.greaterThan(1)), -1, 1)
         );
         multiplier.y.assign(
            select(uv.y.lessThan(0).or(uv.y.greaterThan(1)), -1, 1)
         );
         return multiplier.mul(texture(this.velocity, clampedUV).rg);
      });

      this.fragmentNode = Fn(() => {
         const L = float(sampleVelocity({ uv: vL }).r);
         const R = float(sampleVelocity({ uv: vR }).r);
         const T = float(sampleVelocity({ uv: vT }).g);
         const B = float(sampleVelocity({ uv: vB }).g);
         const div = R.sub(L).add(T).sub(B).mul(0.5);
         return vec4(div, 0, 0, 1);
      })();
   }
}
