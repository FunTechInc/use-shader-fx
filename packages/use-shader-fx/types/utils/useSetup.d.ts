import * as THREE from "three";
import { Size } from "../hooks/types";
import { FxMaterial, FxMaterialProps } from "../materials/core/FxMaterial";
type MaterialConstructor<M> = new (props: FxMaterialProps) => M;
type GeometryConstructor = new (width: number, height: number) => THREE.BufferGeometry;
export declare const useSetup: <M extends FxMaterial>({ size, dpr, material, geometry, geometrySize, ...materialProps }: {
    size: Size;
    dpr: number | false;
    material: MaterialConstructor<M>;
    geometry?: GeometryConstructor;
    geometrySize?: {
        width: number;
        height: number;
    };
} & FxMaterialProps) => {
    scene: THREE.Scene;
    material: M;
    camera: THREE.OrthographicCamera | THREE.PerspectiveCamera;
};
export {};
