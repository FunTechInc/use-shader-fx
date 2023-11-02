import { Root } from './renderer';
import { RootState } from './store';
export declare type GlobalRenderCallback = (timeStamp: number) => void;
/**
 * Adds a global render callback which is called each frame.
 * @see https://docs.pmnd.rs/react-three-fiber/api/additional-exports#addEffect
 */
export declare const addEffect: (callback: GlobalRenderCallback) => () => void;
/**
 * Adds a global after-render callback which is called each frame.
 * @see https://docs.pmnd.rs/react-three-fiber/api/additional-exports#addAfterEffect
 */
export declare const addAfterEffect: (callback: GlobalRenderCallback) => () => void;
/**
 * Adds a global callback which is called when rendering stops.
 * @see https://docs.pmnd.rs/react-three-fiber/api/additional-exports#addTail
 */
export declare const addTail: (callback: GlobalRenderCallback) => () => void;
export declare type GlobalEffectType = 'before' | 'after' | 'tail';
export declare function flushGlobalEffects(type: GlobalEffectType, timestamp: number): void;
export declare function createLoop<TCanvas>(roots: Map<TCanvas, Root>): {
    loop: (timestamp: number) => void;
    /**
     * Invalidates the view, requesting a frame to be rendered. Will globally invalidate unless passed a root's state.
     * @see https://docs.pmnd.rs/react-three-fiber/api/additional-exports#invalidate
     */
    invalidate: (state?: RootState | undefined, frames?: number) => void;
    /**
     * Advances the frameloop and runs render effects, useful for when manually rendering via `frameloop="never"`.
     * @see https://docs.pmnd.rs/react-three-fiber/api/additional-exports#advance
     */
    advance: (timestamp: number, runGlobalEffects?: boolean, state?: RootState | undefined, frame?: import("three").XRFrame | undefined) => void;
};
