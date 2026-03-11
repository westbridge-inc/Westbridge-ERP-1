import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
  Modal,
} from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the modal is open',
    },
    title: {
      control: 'text',
      description: 'Modal title displayed in the header',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for the dialog content',
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function ModalStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Modal Title">
          <p className="text-sm text-muted-foreground">
            This is a basic modal with a title and some content.
          </p>
        </Modal>
      </>
    );
  },
  args: {
    open: false,
    onClose: () => {},
    children: 'Modal content',
  },
};

export const WithForm: Story = {
  render: function ModalFormStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Edit Profile</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Edit Profile">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modal-name">Name</Label>
              <Input id="modal-name" placeholder="Enter your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modal-email">Email</Label>
              <Input id="modal-email" type="email" placeholder="you@example.com" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Save</Button>
            </div>
          </div>
        </Modal>
      </>
    );
  },
  args: {
    open: false,
    onClose: () => {},
    children: 'Modal content',
    title: 'Edit Profile',
  },
};

export const WithoutTitle: Story = {
  render: function ModalNoTitleStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal (No Title)</Button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <p className="text-sm text-muted-foreground">
            This modal has no title, just content.
          </p>
        </Modal>
      </>
    );
  },
  args: {
    open: false,
    onClose: () => {},
    children: 'Modal content',
  },
};

export const UsingDialogPrimitives: Story = {
  name: 'Using Dialog Primitives',
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog with Primitives</DialogTitle>
          <DialogDescription>
            This uses the lower-level Dialog primitives for full control over the layout.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Use DialogHeader, DialogFooter, DialogTitle, and DialogDescription
            for more complex layouts.
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  args: {
    open: false,
    onClose: () => {},
    children: 'Dialog content',
  },
};

export const OpenByDefault: Story = {
  args: {
    open: true,
    title: 'Already Open',
    children: 'This modal renders in an open state for visual testing.',
    onClose: () => {},
  },
};
