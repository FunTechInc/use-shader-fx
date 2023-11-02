![use-shader-fx](public/app.jpg)

`use-shader-fx` is a library designed to easily implement shader effects such as fluid simulations and noise. It relies on [react-three-fiber](https://github.com/pmndrs/react-three-fiber) and has been designed with performance control in mind, especially when combined with [drei](https://github.com/pmndrs/drei).

# Usage

From each `fxHooks`, you can receive [`updateFx`, `setParams`, `fxObject`] in array format. The `config` is an object, which varies for each Hook, containing details such as `size` and `dpr`.

1. `updateFx` - A function to be invoked inside `useFrame`, returning a `THREE.Texture`.
2. `setParams` - A function to refresh the parameters, beneficial for performance tweaking, etc.
3. `fxObject` - An object that holds various FX components, such as scene, camera, material, and renderTarget.

```js
const [updateFx, setParams, fxObject] = useFruid(config);
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
const setUniform = (material, key, value) => {
   material.uniforms[key].value = value;
};
```

## useParams

Returns the refObject of params and its update function.

```ts
const [params, setParams] = useParams<HooksParams>;
{
   // HookPrams
}
```
