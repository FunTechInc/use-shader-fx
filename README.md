# Usage

こんな感じでフックは更新関数を受け取ります

```js
const updateFruid = useFruid();
```

それを useFrame で毎フレーム呼び出します。
返り値としてフレームバッファーテクスチャーを返します。

```js
useFrame((props) => {
   const texture = updateFruid(props);
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

```js
const updateRenderTarget = useDoubleFBO();

// how to render
updateRenderTarget(gl, ({ read, write }) => {
   // callback before gl.render()
});
```

## useSingleFBO

FBO を生成して、焼き付けられた texture を返す、更新関数を生成します。

```js
const updateRenderTarget = useSingleFBO();

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

```js
const resolution = useResolution();
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
