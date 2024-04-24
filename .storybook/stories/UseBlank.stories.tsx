import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import { UseBlank } from "./UseBlank";
import {
   BLANK_PARAMS,
   BlankParams,
} from "../../packages/use-shader-fx/src/fxs/misc/useBlank";

const meta = {
   title: "misc/useBlank",
   component: UseBlank,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseBlank>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
   args: BLANK_PARAMS,
   argTypes: setArgTypes<BlankParams>(BLANK_PARAMS),
};
