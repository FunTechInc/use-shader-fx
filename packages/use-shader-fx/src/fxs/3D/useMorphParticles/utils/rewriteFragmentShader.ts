import * as THREE from "three";

export const rewriteFragmentShader = (
   mapArray: THREE.Texture[] | undefined,
   fragmentShader: string
) => {
   let mapArrayShader = "";
   const mapArrayUniforms: any = {};
   let textureSwitcherCode = "";
   if (mapArray && mapArray.length > 0) {
      textureSwitcherCode += "if (false) {}"; // Dummy conditions for initialisation.
      mapArray.forEach((map, index) => {
         textureSwitcherCode += ` else if (vMapArrayIndex == ${index}.0) {\n`;
         textureSwitcherCode += `  mapArrayColor = texture2D(uMapArray${index}, uv);\n`;
         textureSwitcherCode += `}`;
         mapArrayShader += `
      			uniform sampler2D uMapArray${index};
      		`;
         mapArrayUniforms[`uMapArray${index}`] = { value: map };
      });
      textureSwitcherCode += " else {\n";
      textureSwitcherCode += "  mapArrayColor = vec4(1.0);\n";
      textureSwitcherCode += "}";
      mapArrayShader += `bool isMapArray = true;`;
      mapArrayUniforms["uMapArrayLength"] = { value: mapArray.length };
   } else {
      textureSwitcherCode += "mapArrayColor = vec4(1.0);\n";
      mapArrayShader += `bool isMapArray = false;`;
      mapArrayUniforms["uMapArrayLength"] = { value: 0 };
   }
   const rewritedFragmentShader = fragmentShader
      .replace(`#usf <mapArraySwitcher>`, textureSwitcherCode)
      .replace(`#usf <mapArrayUniforms>`, mapArrayShader);

   return { rewritedFragmentShader, mapArrayUniforms };
};
