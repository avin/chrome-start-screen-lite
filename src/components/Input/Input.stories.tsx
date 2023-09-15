import type {Meta, StoryObj} from 'storybook-solidjs';

import Input from './Input';

const meta: Meta<typeof Input> = {
  component: Input,
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Example: Story = {
  render: () => <Input>Hello</Input>,
};
