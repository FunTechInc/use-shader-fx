import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import { UseAlphaBlending } from "./UseAlphaBlending";
import {
   ALPHABLENDING_PARAMS,
   AlphaBlendingParams,
} from "../../packages/use-shader-fx/src/fxs/utils/useAlphaBlending";

const meta = {
   title: "utils/useAlphaBlending",
   component: UseAlphaBlending,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseAlphaBlending>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
   args: ALPHABLENDING_PARAMS,
   argTypes: setArgTypes<AlphaBlendingParams>(ALPHABLENDING_PARAMS),
};
