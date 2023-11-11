import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import {
   FRUID_PARAMS,
   FruidParams,
} from "../../packages/use-shader-fx/src/hooks/useFruid";
import { UseFruid, UseFruidWithTexture } from "./UseFruid";

const meta = {
   title: "useFruid",
   component: UseFruid,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseFruid>;

export default meta;
type Story = StoryObj<typeof meta>;

const storySetting = {
   args: FRUID_PARAMS,
   argTypes: setArgTypes<FruidParams>(FRUID_PARAMS),
};
export const Fruid: Story = {
   render: (args) => <UseFruid {...args} />,
   ...storySetting,
};
export const WithTexture: Story = {
   render: (args) => <UseFruidWithTexture {...args} />,
   ...storySetting,
};
