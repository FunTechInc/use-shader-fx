import { RootState, Size } from "../../types";
import { DoubleFBOUpdateFunction } from "../../../utils";
import { FluidMaterials } from "../../../materials";
export declare const usePoisson: ({ size, dpr, pressureIterations, ...uniformValues }: {
    size: Size;
    dpr: number | false;
    pressureIterations?: number;
} & Omit<FluidMaterials.PoissonValues, "pressure">, updateRenderTarget: DoubleFBOUpdateFunction) => {
    render: (rootState: RootState) => void;
    material: FluidMaterials.PoissonMaterial;
};
