import { FxMaterial, FxMaterialProps } from "../../core/FxMaterial";

export type RawBlankValues = {};

export class RawBlankMaterial extends FxMaterial {
   static get type() {
      return "RawBlankMaterial";
   }
   constructor(props: FxMaterialProps) {
      super(props);
      this.type = RawBlankMaterial.type;
   }
}
