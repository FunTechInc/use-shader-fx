import { RootState, Size } from "../../types";
import { FluidMaterials } from "../../../materials";
import { SingleFBOUpdateFunction } from "../../../utils";
export declare const useDivergence: ({ size, dpr, ...uniformValues }: {
    size: Size;
    dpr: number | false;
} & FluidMaterials.DivergenceValues, updateRenderTarget: SingleFBOUpdateFunction) => {
    render: (rootState: RootState) => void;
    material: FluidMaterials.DivergenceMaterial;
};
