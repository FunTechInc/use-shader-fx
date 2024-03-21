import * as THREE from "three";

export const rewriteFragmentShader = (
   mapArray: THREE.Texture[] | undefined,
   fragmentShader: string
) => {
   let mapArrayShader = "";
   const mapArrayUniforms: any = {};
   let textureSwitcherCode = "mapArrayColor = ";

   if (mapArray && mapArray.length > 0) {
      mapArray.forEach((map, index) => {
         const condition = `vMapArrayIndex < ${index}.1`; // Comparison with a number with .1 added as the handling of floating points may vary between GPU drivers
         const action = `texture2D(uMapArray${index}, uv)`;
         textureSwitcherCode += `( ${condition} ) ? ${action} : `;
         mapArrayShader += `
        uniform sampler2D uMapArray${index};
      `;
         mapArrayUniforms[`uMapArray${index}`] = { value: map };
      });
      textureSwitcherCode += "vec4(1.);";
      mapArrayShader += `bool isMapArray = true;`;
      mapArrayUniforms["uMapArrayLength"] = { value: mapArray.length };
   } else {
      textureSwitcherCode += "vec4(1.0);";
      mapArrayShader += `bool isMapArray = false;`;
      mapArrayUniforms["uMapArrayLength"] = { value: 0 };
   }
   const rewritedFragmentShader = fragmentShader
      .replace(`#usf <mapArraySwitcher>`, textureSwitcherCode)
      .replace(`#usf <mapArrayUniforms>`, mapArrayShader);

   return { rewritedFragmentShader, mapArrayUniforms };
};
