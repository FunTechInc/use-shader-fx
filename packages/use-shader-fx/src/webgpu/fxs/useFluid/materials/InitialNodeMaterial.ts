import * as THREE from "three/webgpu";
import * as TSL from "three/tsl";

export class initialNodeMaterial extends THREE.NodeMaterial {
   static get type() {
      return "initialNodeMaterial";
   }

   constructor(parameters = {}) {
      super();

      this.setValues(parameters);
   }

   setup(builder: any) {
      this.setupShaders();

      super.setup(builder);
   }

   setupShaders() {
      const { vec4 } = TSL;
      this.vertexNode = TSL.vec4(TSL.positionGeometry, 1);
      this.fragmentNode = vec4(0);
   }
}
