import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
   staticDirs: ["./public"],
   stories: [
      "./stories/**/*.mdx",
      "./stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
   ],
   addons: [
      "@storybook/addon-links",
      "@storybook/addon-essentials",
      "@storybook/addon-onboarding",
      "@storybook/addon-interactions",
   ],
   framework: {
      name: "@storybook/nextjs",
      options: {},
   },
   docs: {
      autodocs: "tag",
   },
};
export default config;
