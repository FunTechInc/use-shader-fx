import path from "path";
import glsl from "vite-plugin-glsl";
import { defineConfig } from "vite";

const root = process.platform === "win32" ? path.resolve("/") : "/";
const external = (id) => !id.startsWith(".") && !id.startsWith(root);

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
         external,
         output: {
            dir: "./build",
         },
      },
      sourcemap: true,
   },
});
