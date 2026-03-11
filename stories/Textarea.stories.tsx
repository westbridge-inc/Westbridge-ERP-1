import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the textarea',
    },
    rows: {
      control: 'number',
      description: 'Number of visible text rows',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  args: {
    placeholder: 'Type something...',
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter your message...',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'This is some pre-filled content in the textarea. It can span multiple lines and will be editable by the user.',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'This textarea is disabled and cannot be edited.',
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Write a detailed description of the issue...',
  },
};

export const CustomRows: Story = {
  args: {
    placeholder: 'This textarea has 8 rows...',
    rows: 8,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2 w-[400px]">
      <Label htmlFor="notes">Notes</Label>
      <Textarea
        id="notes"
        placeholder="Add any additional notes or comments..."
      />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="space-y-2 w-[400px]">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        placeholder="Enter a description"
        defaultValue="Too short"
        className="border-destructive focus-visible:ring-destructive"
        aria-invalid="true"
      />
      <p className="text-sm text-destructive">Description must be at least 20 characters.</p>
    </div>
  ),
};

export const MaxLength: Story = {
  render: () => (
    <div className="space-y-2 w-[400px]">
      <Label htmlFor="bio">Bio</Label>
      <Textarea
        id="bio"
        placeholder="Tell us about yourself..."
        maxLength={200}
      />
      <p className="text-xs text-muted-foreground">Maximum 200 characters.</p>
    </div>
  ),
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    defaultValue: 'This content is read-only. You can select and copy the text, but you cannot modify it.',
  },
};
