import { addons } from "@storybook/manager-api";
import { create } from "@storybook/theming/create";

addons.setConfig({
   theme: create({
      base: "dark",
      brandImage: "/logo.svg",
      brandUrl: "https://github.com/takuma-hmng8/use-shader-fx",
      brandTitle: "use-shader-fx",
      brandTarget: "_blank",
   }),
   panelPosition: "right",
   showPanel: true,
});
