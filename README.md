# For Developers

## カスタムフックがどのようにあるべきか

こんな感じでフックは更新関数を受け取ります

```js
const updateFruid = useFruidEffect();
```

それを useFrame で毎フレーム呼び出せるようにします。
返り値としてフレームバッファーテクスチャーを返すようにしてください。

```js
useFrame((props) => {
   const texture = updateFruid(props);
   const main = mainShaderRef.current;
   if (main) {
      main.u_bufferTexture = texture;
   }
});
```

## 開発に便利な utils

カスタムフック開発に便利な utils をいくつか用意しています
詳細は既存の hook を参照してください

### useRenderTarget

FBO を生成して、ダブルバッファリングしたバッファーテクスチャーを swap して返してくれます。

```js
const updateRenderTarget = useRenderTarget();
```

### useCamera

```js
const camera = useCamera();
```
