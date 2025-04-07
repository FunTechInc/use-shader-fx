import { RootState, Size } from "../../types";
import { FluidMaterials } from "../../../materials";
import { SingleFBOUpdateFunction } from "../../../utils";
export declare const useAdvection: ({ size, dpr, ...uniformValues }: {
    size: Size;
    dpr: number | false;
} & FluidMaterials.AdvectionValues, updateRenderTarget: SingleFBOUpdateFunction) => {
    render: (rootState: RootState) => void;
    material: FluidMaterials.AdvectionMaterial;
};
