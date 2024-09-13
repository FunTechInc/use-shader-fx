import * as THREE from "three";

export const rewriteVertexShader = (
   parameters: THREE.WebGLProgramParametersWithUniforms
) => {
   const isDepth = parameters.shaderType === "MeshDepthMaterial";

   parameters.vertexShader = parameters.vertexShader.replace(
      "#include <beginnormal_vertex>",
      `
			vec3 objectNormal = usf_Normal;
			#ifdef USE_TANGENT
			vec3 objectTangent = vec3( tangent.xyz );
			#endif
		`
   );

   parameters.vertexShader = parameters.vertexShader.replace(
      "#include <begin_vertex>",
      `
			vec3 transformed = usf_Position;
			#ifdef USE_ALPHAHASH
			vPosition = vec3( position );
			#endif
		`
   );

   parameters.vertexShader = parameters.vertexShader.replace(
      "void main() {",
      `
		uniform float uTime;
		uniform float uWobblePositionFrequency;
		uniform float uWobbleTimeFrequency;
		uniform float uWobbleStrength;
		uniform float uWarpPositionFrequency;
		uniform float uWarpTimeFrequency;
		uniform float uWarpStrength;

		${isDepth ? "attribute vec4 tangent;" : ""}
		
		varying float vWobble;
		varying vec2 vPosition;
		
		// edge
		varying vec3 vEdgeNormal;
		varying vec3 vEdgeViewPosition;

		#usf <wobble3D>

		void main() {
		
			vec3 usf_Position = position;
			vec3 usf_Normal = normal;
			vec3 biTangent = cross(normal, tangent.xyz);
			
			// Neighbours positions
			float shift = 0.01;
			vec3 positionA = usf_Position + tangent.xyz * shift;
			vec3 positionB = usf_Position + biTangent * shift;
			
			// wobble
			float wobble = (uWobbleStrength > 0.) ? getWobble(usf_Position) : 0.0;
			float wobblePositionA = (uWobbleStrength > 0.) ? getWobble(positionA) : 0.0;
			float wobblePositionB = (uWobbleStrength > 0.) ? getWobble(positionB) : 0.0;
			
			usf_Position += wobble * normal;
			positionA += wobblePositionA * normal;
			positionB += wobblePositionB * normal;

			// Compute normal
			vec3 toA = normalize(positionA - usf_Position);
			vec3 toB = normalize(positionB - usf_Position);
			usf_Normal = cross(toA, toB);
			
			// Varying
			vPosition = usf_Position.xy;
			vWobble = wobble/uWobbleStrength;
			
			vEdgeNormal = normalize(normalMatrix * usf_Normal);
			vec4 viewPosition = viewMatrix * modelMatrix * vec4(usf_Position, 1.0);
			vEdgeViewPosition = normalize(viewPosition.xyz);
		`
   );
};
