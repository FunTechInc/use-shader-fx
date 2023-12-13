import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import { UseFxTexture } from "./UseFxTexture";
import {
   FxTextureParams,
   FXTEXTURE_PARAMS,
} from "../../packages/use-shader-fx/src/hooks/useFxTexture";

const meta = {
   title: "useFxTexture",
   component: UseFxTexture,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseFxTexture>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
   args: FXTEXTURE_PARAMS,
   argTypes: setArgTypes<FxTextureParams>(FXTEXTURE_PARAMS),
};
