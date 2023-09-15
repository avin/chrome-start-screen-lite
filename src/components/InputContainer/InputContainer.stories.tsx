import type { Meta, StoryObj } from 'storybook-solidjs';
import Input from '../Input/Input';
import InputContainer from './InputContainer';

const meta: Meta<typeof InputContainer> = {
  component: InputContainer,
};

export default meta;
type Story = StoryObj<typeof InputContainer>;

export const Example: Story = {
  render: () => (
    <InputContainer label="Test input">
      <Input type="text" placeholder="Placeholder..." />
    </InputContainer>
  ),
};
