# Usage

それぞれの fxHook からは{updateFx,setParams,fxObject}を受け取ります。

-  updateFx - A function to be called inside `useFrame` that returns a `THREE.Texture`.
-  setParams - A function to update the parameters, useful for performance tuning, etc.
-  fxObject - An object containing various FX components such as scene, camera, material, and render target.

```js
const { updateFx, setParams, fxObject } = useFruid();
```

updateFx は useFrame で実行します。第 1 引数には useFrame から受け取る RootState,第 2 引数に HookPrams を受け取ります。

```js
useFrame((props) => {
   const texture = updateFx(props, params);
   const main = mainShaderRef.current;
   if (main) {
      main.u_bufferTexture = texture;
   }
});
```

# How to make "custom fx hook"

カスタムフック開発に便利な utils をいくつか用意しています
詳細は既存の hook を参照してください

## useDoubleFBO

FBO を生成して、ダブルバッファリングしたバッファーテクスチャーを swap して返してくれます。
第 3 引数には options が入ります。

-  isDpr: Whether to multiply dpr, default:false
-  isSizeUpdate: Whether to resize when resizing occurs. If isDpr is true, set FBO to setSize even if dpr is changed, default:false

drei の useFBO はデフォルトで dpr と size の変更で setSize してしまうため、バッファーテクスチャーが更新されてしまいます。そこで、dpr と size の更新に対して non reactive な hook を作成しました。options でそれぞれ reactive にすることが可能です。

もし resize させたい場合は、fxHook が第 3 引数に受け取る fxObject に renderTarget も格納しています。

```js
const [velocityFBO, updateVelocityFBO] = useDoubleFBO(scene, camera, {
   isDpr: true,
   isSizeUpdate: true,
});

// how to render
updateVelocityFBO(gl, ({ read, write }) => {
   // callback before gl.render()
});
```

## useSingleFBO

FBO を生成して、焼き付けられた texture を返す、更新関数を生成します。

```js
const updateRenderTarget = useSingleFBO(scene, camera, options);

// how to render
updateRenderTarget(gl, ({ read }) => {
   // callback before gl.render()
});
```

## useCamera

```js
const camera = useCamera();
```

## usePointer

フレームの pointer の vec2 を渡すと、currentPointer,prevPointer, diffPointer, isVelocityUpdate, velocity を返す更新関数を生成します。

```js
const updatePointer = usePointer();

const { currentPointer, prevPointer, diffPointer, isVelocityUpdate, velocity } =
   updatePointer(pointer);
```

## useResolution

キャンバスのサイズの state のフック

-  isDpr: Whether to multiply dpr, default:false

```js
const resolution = useResolution(isDpr);
```

## useAddMesh

メッシュを生成して、scene,geometry,material に add する。mesh を返す。

```js
useAddMesh(scene, geometry, material);
```

## setUniform

シェーダーマテリアルの uniforms に value をセットする関数

```js
const setUniform = (material, key, value) => {
   material.uniforms[key].value = value;
};
```

## useParams

params の refObject とその更新用関数を返します。

```ts
const [params, setParams] =
   useParams <FruidParams>
   {
      density_dissipation: 0.0,
      velocity_dissipation: 0.0,
      velocity_acceleration: 0.0,
      pressure_dissipation: 0.0,
      pressure_iterations: 20,
      curl_strength: 0.0,
      splat_radius: 0.001,
      fruid_color: new THREE.Vector3(1.0, 1.0, 1.0),
   };
```
