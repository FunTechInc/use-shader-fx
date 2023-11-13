import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
   staticDirs: ["./public"],
   stories: [
      "./stories/**/*.mdx",
      "./stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
   ],
   webpackFinal: async (config) => {
      config.module?.rules?.push({
         test: /\.(glsl|vs|fs|vert|frag)$/,
         exclude: /node_modules/,
         use: ["raw-loader", "glslify-loader"],
      });
      return config;
   },
   addons: ["@storybook/addon-essentials", "@storybook/addon-docs"],
   framework: {
      name: "@storybook/nextjs",
      options: {
         nextConfigPath: "../next.config.js",
      },
   },
   docs: {
      autodocs: "tag",
   },
};
export default config;
