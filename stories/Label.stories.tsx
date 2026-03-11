import type { Meta, StoryObj } from '@storybook/react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';

const meta = {
  title: 'UI/Label',
  component: Label,
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Label content',
    },
    htmlFor: {
      control: 'text',
      description: 'The ID of the associated form element',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  args: {
    children: 'Label',
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Email Address',
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="space-y-2 w-[300px]">
      <Label htmlFor="label-input">Your Name</Label>
      <Input id="label-input" placeholder="Enter your name" />
    </div>
  ),
};

export const WithTextarea: Story = {
  render: () => (
    <div className="space-y-2 w-[300px]">
      <Label htmlFor="label-textarea">Description</Label>
      <Textarea id="label-textarea" placeholder="Enter a description..." />
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="space-y-2 w-[300px]">
      <Label htmlFor="required-input">
        Email <span className="text-destructive">*</span>
      </Label>
      <Input id="required-input" type="email" placeholder="you@example.com" required />
    </div>
  ),
};

export const DisabledPeer: Story = {
  render: () => (
    <div className="space-y-2 w-[300px]">
      <Label htmlFor="disabled-input">Disabled Field</Label>
      <Input id="disabled-input" disabled defaultValue="Cannot edit" className="peer" />
    </div>
  ),
};

export const MultipleLabels: Story = {
  render: () => (
    <div className="space-y-4 w-[300px]">
      <div className="space-y-2">
        <Label htmlFor="first-name">First Name</Label>
        <Input id="first-name" placeholder="John" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="last-name">Last Name</Label>
        <Input id="last-name" placeholder="Doe" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input id="company" placeholder="Acme Corp" />
      </div>
    </div>
  ),
};
