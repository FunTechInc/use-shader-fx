import * as THREE from "three";
import { Size } from "@react-three/fiber";
export declare const useCamera: (size: Size, cameraType?: "OrthographicCamera" | "PerspectiveCamera") => THREE.OrthographicCamera | THREE.PerspectiveCamera;
