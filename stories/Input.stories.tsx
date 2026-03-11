import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: 'The input type',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the input',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  args: {
    type: 'text',
    placeholder: 'Enter text...',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Hello World',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'you@example.com',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: '0',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled input',
  },
};

export const DisabledWithValue: Story = {
  args: {
    disabled: true,
    defaultValue: 'Cannot edit this',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2 w-[300px]">
      <Label htmlFor="with-label">Email Address</Label>
      <Input id="with-label" type="email" placeholder="you@example.com" />
    </div>
  ),
};

export const WithError: Story = {
  render: () => (
    <div className="space-y-2 w-[300px]">
      <Label htmlFor="with-error">Email</Label>
      <Input
        id="with-error"
        type="email"
        placeholder="you@example.com"
        defaultValue="invalid-email"
        className="border-destructive focus-visible:ring-destructive"
        aria-invalid="true"
      />
      <p className="text-sm text-destructive">Please enter a valid email address.</p>
    </div>
  ),
};

export const File: Story = {
  args: {
    type: 'file',
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="space-y-4 w-[350px]">
      <div className="space-y-2">
        <Label>Text</Label>
        <Input type="text" placeholder="Enter text" />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" placeholder="you@example.com" />
      </div>
      <div className="space-y-2">
        <Label>Password</Label>
        <Input type="password" placeholder="Enter password" />
      </div>
      <div className="space-y-2">
        <Label>Number</Label>
        <Input type="number" placeholder="0" />
      </div>
      <div className="space-y-2">
        <Label>Search</Label>
        <Input type="search" placeholder="Search..." />
      </div>
    </div>
  ),
};
