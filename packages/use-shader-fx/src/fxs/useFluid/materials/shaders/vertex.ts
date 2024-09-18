const base = `
	precision highp float;

	uniform vec2 texelsize;
	varying vec2 vUv;
`;

const boxVarying = `
	uniform bool isBounce;
	varying vec2 vL;
	varying vec2 vR;
	varying vec2 vT;
	varying vec2 vB;
`;

const getPosition = (isBounce: boolean = true) => {
   return `
		vec3 pos = position;
		vec2 scale = ${
         isBounce
            ? "isBounce ? vec2(1.,1.) : 1.-texelsize*2."
            : "1.-texelsize*2."
      };
		pos.xy = pos.xy * scale;
		vUv = vec2(.5)+(pos.xy)*.5;		
	`;
};

const getBoxCompute = (diff: string) => {
   return `
		vL = vUv - vec2(texelsize.x * ${diff}, 0.0);
		vR = vUv + vec2(texelsize.x * ${diff}, 0.0);
		vT = vUv + vec2(0.0, texelsize.y * ${diff});
		vB = vUv - vec2(0.0, texelsize.y * ${diff});
	`;
};

const vertex = {
   main: `
		${base}
		${boxVarying}

		void main(){
		
			${getPosition()}
			${getBoxCompute("1.")}

			gl_Position = vec4(pos, 1.0);
		}
	`,
   poisson: `
		${base}
		${boxVarying}
		
		void main(){

			${getPosition()}
			${getBoxCompute("2.")}

			gl_Position = vec4(pos, 1.0);
		}
	`,
   advection: `
		${base}
		void main(){
			${getPosition(false)}
			gl_Position = vec4(pos, 1.0);
		}
	`,
   splat: `
		${base}
		uniform vec2 center;
		uniform vec2 scale;
		void main(){
			vec2 pos = position.xy * scale * 2.0 * texelsize + center;
			vUv = uv;
			gl_Position = vec4(pos, 0.0, 1.0);
		}
	`,
};

export default vertex;
