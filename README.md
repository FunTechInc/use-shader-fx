![use-shader-fx](public/app.jpg)

`use-shader-fx` is a library designed to easily implement shader effects such as fluid simulations and noise. It relies on [react-three-fiber](https://github.com/pmndrs/react-three-fiber) and has been designed with performance control in mind, especially when combined with [drei](https://github.com/pmndrs/drei).

For details on each FX, please refer to Storybook
👉 [Storybook](https://use-shader-fx-stories.vercel.app/) 👈

```bash
npm install @hmng8/use-shader-fx
```

# Usage

From each `fxHooks`, you can receive [`updateFx`, `setParams`, `fxObject`] in array format. The `config` is an object, which varies for each Hook, containing details such as `size` and `dpr`.

1. `updateFx` - A function to be invoked inside `useFrame`, returning a `THREE.Texture`.
2. `setParams` - A function to refresh the parameters, beneficial for performance tweaking, etc.
3. `fxObject` - An object that holds various FX components, such as scene, camera, material, and renderTarget.

```js
const [updateFx, setParams, fxObject] = useFluid(config);
```

Execute `updateFx` in `useFrame`. The first argument receives the RootState from `useFrame`, and the second one takes `HookPrams`. Each fx has its `HookPrams`, and each type is exported.

```js
useFrame((props) => {
   const texture = updateFx(props, params);
   const main = mainShaderRef.current;
   if (main) {
      main.u_bufferTexture = texture;
   }
});
```

## The simplest example

This is the simplest example!

```tsx
import * as THREE from "three";
import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useFluid } from "@hmng8/use-shader-fx";

export const Demo = () => {
   const ref = useRef<THREE.ShaderMaterial>(null);
   const size = useThree((state) => state.size);
   const dpr = useThree((state) => state.viewport.dpr);
   const [updateFluid] = useFluid({ size, dpr });
   useFrame((props) => {
      ref.current!.uniforms.u_fx.value = updateFluid(props);
   });

   return (
      <mesh>
         <planeGeometry args={[2, 2]} />
         <shaderMaterial
            ref={ref}
            vertexShader={`
					varying vec2 vUv;
						void main() {
							vUv = uv;
							gl_Position = vec4(position, 1.0);
						}
						`}
            fragmentShader={`
						precision highp float;
						varying vec2 vUv;
						uniform sampler2D u_fx;

						void main() {
							vec2 uv = vUv;
							gl_FragColor = texture2D(u_fx, uv);
						}
					`}
            uniforms={{
               u_fx: { value: null },
            }}
         />
      </mesh>
   );
};
```

# Performance

You can control the `dpr` using the `PerformanceMonitor` from [drei](https://github.com/pmndrs/drei). For more details, please refer to the [scaling-performance](https://docs.pmnd.rs/react-three-fiber/advanced/scaling-performance) of r3f.

```js
export const Fx = () => {
   const [dpr, setDpr] = useState(1.5);
   return (
      <Canvas dpr={dpr}>
         <PerformanceMonitor
            factor={1}
            onChange={({ factor }) => {
               console.log(`dpr:${dpr}`);
               setDpr(Math.round((0.5 + 1.5 * factor) * 10) / 10);
            }}>
            <Suspense fallback={null}>
               <Scene />
            </Suspense>
            <Perf position={"bottom-right"} minimal={false} />
         </PerformanceMonitor>
      </Canvas>
   );
};
```

By using the `PerformanceMonitor`, you can subscribe to performance changes with `usePerformanceMonitor`. For more details, refer to [drei](https://github.com/pmndrs/drei#performancemonitor).

With `setParams` received from `fxHooks`, it's possible to independently control high-load items such as iteration counts.

```js
usePerformanceMonitor({
   onChange({ factor }) {
      setParams({
         pressure_iterations: Math.round(20 * factor),
      });
   },
});
```

# How to make "custom fxHooks"

With some functions provided by `use-shader-fx`, creating a custom hook is straightforward (the challenging part is only the shader!). Please refer to existing `fxHooks` for details.

In addition, we have prepared a template in the repository below that is useful for creating custom hooks, so please clone and use it in the location where you created your custom hook.

```bash
git clone https://github.com/takuma-hmng8/CreateShaderFx
```

If you can create a cool FX, please contribute!
👉 [CONTRIBUTING](CONTRIBUTING.md)! 👈

## useDoubleFBO

Generates FBO and returns a double-buffered buffer texture after swapping. The `useFBO` of `drei` by default performs `setSize` for `THREE.WebGLRenderTarget` upon changes in `dpr` and `size`, making it challenging to handle buffer textures during changes like dpr adjustments. Therefore, a non-reactive hook against updates of dpr and size was created. It's possible to make them reactive individually through options. If you want to `setSize` at a custom timing, the `fxObject` that the fxHook receives as the third argument also stores `renderTarget`.

```ts
type UseFboProps = {
   scene: THREE.Scene;
   camera: THREE.Camera;
   size: Size;
   /** If dpr is set, dpr will be multiplied, default:false */
   dpr?: number | false;
   /** Whether to resize on resizes. If isDpr is true, set FBO to setSize even if dpr is changed, default:false */
   isSizeUpdate?: boolean;
};

const [velocityFBO, updateVelocityFBO] = useDoubleFBO(UseFboProps);
```

When you call the update function, it returns a double-buffered texture. The second argument gets a function called before `gl.render()`, allowing for operations like swapping materials or setting uniforms.

```js
const texture = updateVelocityFBO(gl, ({ read, write }) => {
   // callback before gl.render()
   setMeshMaterial(materials.advectionMaterial);
   setUniform(materials.advectionMaterial, "uVelocity", read);
});
```

## useSingleFBO

This is a version without double buffering.

```js
const [renderTarget, updateRenderTarget] = useSingleFBO(UseFboProps);
```

## useCamera

Generates and returns a `THREE.OrthographicCamera`.

```js
const camera = useCamera(size);
```

## usePointer

When given the `pointer` vector2 from r3f's `RootState`, it generates an update function that returns {currentPointer, prevPointer, diffPointer, isVelocityUpdate, velocity}.

```js
const updatePointer = usePointer();

const { currentPointer, prevPointer, diffPointer, isVelocityUpdate, velocity } =
   updatePointer(pointer);
```

## useResolution

This hook returns `resolution`. If `dpr` isn't set (or set to false), dpr won't be multiplied.

```ts
const resolution = useResolution(size: Size, dpr: number | false = false);
```

## useAddMesh

Creates a mesh and adds it to scene, geometry, and material. Returns the mesh.

```js
useAddMesh(scene, geometry, material);
```

## setUniform

A function to set values in the uniforms of the shader material.

```js
setUniform(material, "key", someValue);
```

## useParams

Returns the refObject of params and its update function.

```ts
const [params, setParams] = useParams<HooksParams>;
{
   // HookPrams
}
```
