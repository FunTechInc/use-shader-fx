import * as THREE from "three";
import { HooksProps } from "../../types";

export interface HooksProps3D extends HooksProps {
   /** For 3D series, you should use the r3f camera as it is as the camera passed to renderTarget. */
   camera: THREE.Camera;
}

export type Create3DHooksProps = {
   /** r3fのシーンを入れてもいいし、どのシーンにもaddしたくない場合は何も渡さないとシーンに入れずにオブジェクトだけ返すよ , default : false*/
   scene?: THREE.Scene | false;
};
