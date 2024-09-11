import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";
import { NoiseValues } from "./";

export class NoiseNodeMaterial extends THREE.NodeMaterial {
   static get type() {
      return "NoiseNodeMaterial";
   }

   noiseNode: THREE.Node | null;

   noiseScale: NoiseValues["noiseScale"];

   constructor(parameters = {}) {
      super();

      this.noiseNode = null;

      this.noiseScale = 0.03;

      this.setValues(parameters);
   }

   setup(builder: any) {
      this.setupShaders();

      super.setup(builder);
   }

   setupShaders() {
      this.vertexNode = TSL.vec4(TSL.positionGeometry, 1);

      const noiseNode = this.noiseNode
         ? this.noiseNode
         : TSL.mx_fractal_noise_vec3(
              TSL.uv().add(TSL.timerLocal(this.noiseScale))
           );

      this.fragmentNode = TSL.vec4(1).mul(noiseNode);
   }
}
