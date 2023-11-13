import * as THREE from "three";
import { FruidMaterials } from "./useMesh";
import { Size } from "@react-three/fiber";
import { HooksReturn } from "../types";
import { DoubleRenderTarget } from "../../utils/types";
export type FruidParams = {
    /** density disspation , default:0.98 */
    density_dissipation?: number;
    /** velocity dissipation , default:0.99 */
    velocity_dissipation?: number;
    /** velocity acceleration , default:10.0 */
    velocity_acceleration?: number;
    /** pressure dissipation , default:0.9 */
    pressure_dissipation?: number;
    /** pressure iterations. パフォーマンスに影響する , default:20 */
    pressure_iterations?: number;
    /** curl_strength , default:35 */
    curl_strength?: number;
    /** splat radius , default:0.002 */
    splat_radius?: number;
    /** 流体のカラー.THREE.Vector3 あるいは、THREE.Vector3を返す関数を受け入れます.関数はvelocity:THREE.Vector2を引数に取ります.  , default:THREE.Vector3(1.0, 1.0, 1.0) */
    fruid_color?: ((velocity: THREE.Vector2) => THREE.Vector3) | THREE.Vector3;
};
export type FruidObject = {
    scene: THREE.Scene;
    materials: FruidMaterials;
    camera: THREE.Camera;
    renderTarget: {
        velocity: DoubleRenderTarget;
        density: DoubleRenderTarget;
        curl: THREE.WebGLRenderTarget;
        divergence: THREE.WebGLRenderTarget;
        pressure: DoubleRenderTarget;
    };
};
export declare const FRUID_PARAMS: FruidParams;
/**
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export declare const useFruid: ({ size, dpr, }: {
    size: Size;
    dpr: number;
}) => HooksReturn<FruidParams, FruidObject>;
