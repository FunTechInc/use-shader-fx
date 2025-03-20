import { RootState, Size } from "../../types";
import { SingleFBOUpdateFunction } from "../../../utils";
import { FluidMaterials } from "../../../materials";
export declare const usePressure: ({ size, dpr, ...uniformValues }: {
    size: Size;
    dpr: number | false;
} & FluidMaterials.PressureValues, updateRenderTarget: SingleFBOUpdateFunction) => {
    render: (rootState: RootState) => void;
    material: FluidMaterials.PressureMaterial;
};
