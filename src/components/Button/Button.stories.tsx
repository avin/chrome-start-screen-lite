import type { Meta, StoryObj } from 'storybook-solidjs';
import Button from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  render: () => <Button>Hello</Button>,
};

export const Disabled: Story = {
  render: () => <Button disabled>Hello</Button>,
};
