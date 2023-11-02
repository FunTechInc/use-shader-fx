import path from "path";
import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";

export default defineConfig({
   root: "src",
   plugins: [glsl()],
   build: {
      lib: {
         entry: path.resolve(__dirname, "src/index.js"),
         name: "use-shader-fx",
         fileName: "use-shader-fx",
      },
      rollupOptions: {
         external: ["react", "@react-three/fiber", "react-dom", "three"],
         output: {
            dir: "./build",
            globals: {
               react: "React",
               "@react-three/fiber": "ReactThreeFiber",
               "react-dom": "ReactDOM",
               three: "THREE",
            },
         },
      },
      sourcemap: true,
   },
});
