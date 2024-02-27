import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import {
   COLORSTRATA_PARAMS,
   ColorStrataParams,
} from "../../packages/use-shader-fx/src/fxs/noises/useColorStrata";
import { UseColorStrata, UseColorStrataWithNoise } from "./UseColorStrata";

const meta = {
   title: "noises/useColorStrata",
   component: UseColorStrata,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseColorStrata>;

export default meta;
type Story = StoryObj<typeof meta>;

const storySetting = {
   args: COLORSTRATA_PARAMS,
   argTypes: setArgTypes<ColorStrataParams>(COLORSTRATA_PARAMS),
};
export const ColorStrata: Story = {
   render: (args) => <UseColorStrata {...args} />,
   ...storySetting,
};
export const WithNoise: Story = {
   render: (args) => <UseColorStrataWithNoise {...args} />,
   ...storySetting,
};
