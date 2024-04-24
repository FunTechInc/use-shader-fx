import * as THREE from "three";
import { HooksProps, MaterialProps } from "../../types";
export interface HooksProps3D extends HooksProps {
    /** For 3D series, you should use the r3f camera as it is as the camera passed to renderTarget. */
    camera: THREE.Camera;
}
export interface Create3DHooksProps extends MaterialProps {
    /** You can put the r3f scene in, or if you don't want to add to any scene, you can pass nothing and it will just return the object without putting it in the scene, default : `false` */
    scene?: THREE.Scene | false;
}
