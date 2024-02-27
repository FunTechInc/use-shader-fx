import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import { UseMarble } from "./UseMarble";
import {
   MARBLE_PARAMS,
   MarbleParams,
} from "../../packages/use-shader-fx/src/fxs/noises/useMarble";

const meta = {
   title: "noises/useMarble",
   component: UseMarble,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseMarble>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
   args: MARBLE_PARAMS,
   argTypes: setArgTypes<MarbleParams>(MARBLE_PARAMS),
};
