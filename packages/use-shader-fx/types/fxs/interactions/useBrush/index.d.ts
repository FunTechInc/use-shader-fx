import * as THREE from "three";
import { PointerValues } from "../../../misc/usePointer";
import { HooksProps, HooksReturn } from "../../types";
import { DoubleRenderTarget } from "../../../utils/useDoubleFBO";
export type BrushParams = {
    /** Texture applied to the brush, If texture is true, it will take precedence over color , default : `false` */
    texture?: THREE.Texture | false;
    /** You can attach an fx map , default : `false` */
    map?: THREE.Texture | false;
    /** map intensity , default : `0.1` */
    mapIntensity?: number;
    /** size of the stamp, percentage of the size ,default : `0.05` */
    radius?: number;
    /** Strength of smudge effect , default : `0.0`*/
    smudge?: number;
    /** dissipation rate. If set to 1, it will remain. , default : `1.0` */
    dissipation?: number;
    /** Strength of motion blur , default : `0.0` */
    motionBlur?: number;
    /** Number of motion blur samples. Affects performance default : `5` */
    motionSample?: number;
    /** brush color , it accepts a function that returns THREE.Vector3.The function takes velocity:THREE.Vector2 as an argument. , default : `THREE.Vector3(1.0, 1.0, 1.0)` */
    color?: ((velocity: THREE.Vector2) => THREE.Vector3) | THREE.Vector3 | THREE.Color;
    /** Follows the cursor even if it loses speed , default : `false` */
    isCursor?: boolean;
    /** brush pressure (0 to 1) , default : `1.0` */
    pressure?: number;
    /** When calling usePointer in a frame loop, setting PointerValues ​​to this value prevents double calls , default : `false` */
    pointerValues?: PointerValues | false;
};
export type BrushObject = {
    scene: THREE.Scene;
    mesh: THREE.Mesh;
    material: THREE.Material;
    camera: THREE.Camera;
    renderTarget: DoubleRenderTarget;
    output: THREE.Texture;
};
export declare const BRUSH_PARAMS: BrushParams;
/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usage
 */
export declare const useBrush: ({ size, dpr, samples, isSizeUpdate, onBeforeCompile, }: HooksProps) => HooksReturn<BrushParams, BrushObject>;
