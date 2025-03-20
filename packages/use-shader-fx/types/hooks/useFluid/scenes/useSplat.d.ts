import { RootState, Size } from "../../types";
import { SingleFBOUpdateFunction } from "../../../utils";
import { FluidMaterials } from "../../../materials";
export declare const useSplat: ({ size, dpr, force, ...uniformValues }: {
    size: Size;
    dpr: number | false;
    force?: number;
} & FluidMaterials.SplatValuesClient, updateRenderTarget: SingleFBOUpdateFunction) => {
    render: (rootState: RootState) => void;
    material: FluidMaterials.SplatMaterial;
};
