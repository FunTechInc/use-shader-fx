import * as THREE from "three";
import { Size } from "../fxs/types";
export declare const useCamera: (size: Size, cameraType?: "OrthographicCamera" | "PerspectiveCamera") => THREE.OrthographicCamera | THREE.PerspectiveCamera;
