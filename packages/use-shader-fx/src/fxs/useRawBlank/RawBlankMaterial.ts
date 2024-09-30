import { FxMaterial, FxMaterialProps } from "../materials/FxMaterial";

export class RawBlankMaterial extends FxMaterial {
   static get type() {
      return "RawBlankMaterial";
   }
   constructor(props: FxMaterialProps) {
      super(props);
      this.type = RawBlankMaterial.type;
   }
}
