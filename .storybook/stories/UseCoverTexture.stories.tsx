import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import { UseCoverTexture } from "./UseCoverTexture";
import {
   COVERTEXTURE_PARAMS,
   CoverTextureParams,
} from "../../packages/use-shader-fx/src/fxs/utils/useCoverTexture";

const meta = {
   title: "utils/useCoverTexture",
   component: UseCoverTexture,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseCoverTexture>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
   args: COVERTEXTURE_PARAMS,
   argTypes: setArgTypes<CoverTextureParams>(COVERTEXTURE_PARAMS),
};
