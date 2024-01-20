/// <reference types="react" />
import * as THREE from "three";
import { HooksProps, HooksReturn } from "../types";
import { IsIntersecting } from "./utils/useIsIntersecting";
import { UseDomView } from "./utils/useAllDomIntersectionTest";
export type DomSyncerParams = {
    /** DOM array you want to synchronize */
    dom?: (HTMLElement | Element | null)[];
    /** Texture array that you want to synchronize with the DOM rectangle */
    texture?: THREE.Texture[];
    /** Texture resolution array to pass */
    resolution?: THREE.Vector2[];
    /** default:0.0[] */
    boderRadius?: number[];
    /** the angle you want to rotate */
    rotation?: THREE.Euler[];
    /** Array of callback functions when crossed */
    onIntersect?: ((entry: IntersectionObserverEntry) => void)[];
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
 * @link https://github.com/takuma-hmng8/use-shader-fx#usage
 */
export declare const useDomSyncer: ({ size, dpr, samples }: HooksProps, dependencies?: import("react").DependencyList) => HooksReturn<DomSyncerParams, DomSyncerObject>;
