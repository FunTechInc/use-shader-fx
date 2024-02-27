import * as THREE from "three";
import { Key } from "react";
import { HooksProps, HooksReturn } from "../../fxs/types";
import { IsIntersecting } from "./utils/useIsIntersecting";
import { UseDomView } from "./utils/createUseDomView";
export type DomSyncerParams = {
    /** DOM array you want to synchronize */
    dom?: (HTMLElement | Element | null)[];
    /** Texture array that you want to synchronize with the DOM rectangle */
    texture?: THREE.Texture[];
    /** default:0.0[] */
    boderRadius?: number[];
    /** the angle you want to rotate */
    rotation?: THREE.Euler[];
    /** Array of callback functions when crossed */
    onIntersect?: ((entry: IntersectionObserverEntry) => void)[];
    /** Because DOM rendering and React updates occur asynchronously, there may be a lag between updating dependent arrays and setting DOM arrays. That's what the Key is for. If the dependent array is updated but the Key is not, the loop will skip and return an empty texture. By updating the timing key when DOM acquisition is complete, you can perfectly synchronize DOM and Mesh updates.updateKey must be a unique value for each update, for example `performance.now()`.*/
    updateKey?: Key;
};
export type DomSyncerObject = {
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderTarget: THREE.WebGLRenderTarget;
    output: THREE.Texture;
    /**
     * A function that returns a determination whether the DOM intersects or not.
     * The boolean will be updated after executing the onIntersect function.
     * @param index - Index of the dom for which you want to return an intersection decision. -1 will return the entire array.
     * @param once - If set to true, it will continue to return true once crossed.
     */
    isIntersecting: IsIntersecting;
    /** target's DOMRect[] */
    DOMRects: DOMRect[];
    /** target's intersetions boolean[] */
    intersections: boolean[];
    /** You can set callbacks for when at least one DOM is visible and when it is completely hidden. */
    useDomView: UseDomView;
};
export declare const DOMSYNCER_PARAMS: DomSyncerParams;
/**
 * @link https://github.com/FunTechInc/use-shader-fx?tab=readme-ov-file#usedomsyncer
 * @param dependencies - When this dependency array is changed, the mesh and intersection judgment will be updated according to the passed DOM array.
 */
export declare const useDomSyncer: ({ size, dpr, samples }: HooksProps, dependencies?: import("react").DependencyList) => HooksReturn<DomSyncerParams, DomSyncerObject>;
