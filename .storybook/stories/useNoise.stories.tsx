import * as React from "react";
import type { StoryObj } from "@storybook/react";
import { setArgTypes } from "../utils/setArgTypes";
import { Setup } from "../utils/Setup";
import type { Meta } from "@storybook/react";
import {
   NOISE_PARAMS,
   NoiseParams,
} from "../../packages/use-shader-fx/src/hooks/useNoise";
import { UseNoise, UseNoiseWithTexture } from "./UseNoise";

const meta = {
   title: "useNoise",
   component: UseNoise,
   tags: ["autodocs"],
   decorators: [(storyFn: any) => <Setup>{storyFn()}</Setup>],
} satisfies Meta<typeof UseNoise>;

export default meta;
type Story = StoryObj<typeof meta>;

const storySetting = {
   args: NOISE_PARAMS,
   argTypes: setArgTypes<NoiseParams>(NOISE_PARAMS),
};

export const OnlyNoise: Story = {
   render: (args) => <UseNoise {...args} />,
   ...storySetting,
};

export const WithTexture: Story = {
   render: (args) => <UseNoiseWithTexture {...args} />,
   ...storySetting,
};
