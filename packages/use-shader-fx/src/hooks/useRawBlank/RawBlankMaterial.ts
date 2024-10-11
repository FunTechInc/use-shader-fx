import { FxMaterial, FxMaterialProps } from "../../materials/core/FxMaterial";

export class RawBlankMaterial extends FxMaterial {
   static get type() {
      return "RawBlankMaterial";
   }
   constructor(props: FxMaterialProps) {
      super(props);
      this.type = RawBlankMaterial.type;

      this.defineUniformAccessors();
   }
}
