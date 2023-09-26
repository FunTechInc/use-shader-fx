//背景テクスチャーのアスペクト比（2の累乗）
export const TEXTURE_RATIO = {
   x: 512,
   y: 512,
};

//frameで呼び出す、コンポーネントレベルの状態管理
type TDistortionState = {
   noiseStrength: number;
   progress: number;
   progress2: number;
};
export const distortionState: TDistortionState = {
   noiseStrength: 0.5,
   progress: 0,
   progress2: 0,
};
