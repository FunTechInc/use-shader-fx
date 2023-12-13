import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import {
   WAVE_PARAMS,
   WaveParams,
} from "../../packages/use-shader-fx/src/hooks/useWave";
import { UseWave, UseWaveWithTexture } from "./UseWave";

const meta = {
   title: "useWave",
   component: UseWave,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseWave>;

export default meta;
type Story = StoryObj<typeof meta>;

const storySetting = {
   args: WAVE_PARAMS,
   argTypes: setArgTypes<WaveParams>(WAVE_PARAMS),
};
export const Fluid: Story = {
   render: (args) => <UseWave {...args} />,
   ...storySetting,
};
export const WithTexture: Story = {
   render: (args) => <UseWaveWithTexture {...args} />,
   ...storySetting,
};
