import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import { UseBlending } from "./UseBlending";
import {
   BlendingParams,
   BLENDING_PARAMS,
} from "../../packages/use-shader-fx/src/hooks/useBlending";

const meta = {
   title: "useBlending",
   component: UseBlending,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseBlending>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
   args: BLENDING_PARAMS,
   argTypes: setArgTypes<BlendingParams>(BLENDING_PARAMS),
};
