import { RootState, Size } from "../../types";
import { SingleFBOUpdateFunction } from "../../../utils";
import { FluidMaterials } from "../../../materials";
export declare const useOutput: ({ size, dpr, ...values }: {
    size: Size;
    dpr: number | false;
} & FluidMaterials.OutputValues, updateRenderTarget: SingleFBOUpdateFunction) => {
    render: (rootState: RootState) => void;
    material: FluidMaterials.OutputMaterial;
};
