import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import { UseHSV } from "./UseHSV";
import {
   HSV_PARAMS,
   HSVParams,
} from "../../packages/use-shader-fx/src/fxs/utils/useHSV";

const meta = {
   title: "utils/useHSV",
   component: UseHSV,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseHSV>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
   args: HSV_PARAMS,
   argTypes: setArgTypes<HSVParams>(HSV_PARAMS),
};
