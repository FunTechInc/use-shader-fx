import * as THREE from "three";
import transmission_pars_fragment from "../shaders/transmission_pars_fragment.glsl";
import transmission_fragment from "../shaders/transmission_fragment.glsl";

export const resolveEachMaterial = ({
   mat,
   isCustomTransmission,
   parameters,
}: {
   mat: THREE.Material;
   isCustomTransmission: boolean;
   parameters: THREE.WebGLProgramParametersWithUniforms;
}) => {
   // custom transmission
   if (mat.type === "MeshPhysicalMaterial" && isCustomTransmission) {
      parameters.fragmentShader = parameters.fragmentShader.replace(
         "#include <transmission_pars_fragment>",
         `${transmission_pars_fragment}`
      );

      parameters.fragmentShader = parameters.fragmentShader.replace(
         "#include <transmission_fragment>",
         `${transmission_fragment}`
      );
   }

   // if normalMap is defined, don't add tangent attribute
   if (!(mat as any).normalMap) {
      parameters.vertexShader = parameters.vertexShader.replace(
         "void main() {",
         `
				attribute vec4 tangent;
				
				void main() {
			`
      );
   }
};
