// src/components/notes/NoteForm.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import toast from 'react-hot-toast';
import type{ Note, ApiErrorResponse } from '@/types';
import type{ NoteInput } from '@/services/noteService'; // Import NoteInput
import { AxiosError } from 'axios';

interface NoteFormProps {
  onSubmit: (noteData: NoteInput) => Promise<void>; // onSubmit now takes NoteInput
  initialData?: Note | null; // The full Note object for editing
  onFinished: () => void; // To close dialog or refresh
}

function NoteForm({ onSubmit, initialData, onFinished }: NoteFormProps) {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [tags, setTags] = useState<string>(''); // Store tags as a comma-separated string for UI
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setContent(initialData.content || '');
      setTags(initialData.tags ? initialData.tags.join(', ') : '');
    } else {
      setTitle('');
      setContent('');
      setTags('');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content cannot be empty.");
      return;
    }
    setIsLoading(true);
    try {
      const noteData: NoteInput = {
        title,
        content,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      };
      await onSubmit(noteData); // This will be createNote or updateNote logic in parent
      // Parent (DashboardPage) will handle success toast and closing
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error("Note form error:", axiosError.response?.data?.message || axiosError.message);
      toast.error(axiosError.response?.data?.message || "Failed to save note.");
    } finally {
      setIsLoading(false);
      // onFinished(); // Parent will call this on success or cancel
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px] md:sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{initialData ? 'Edit Note' : 'Create New Note'}</DialogTitle>
        <DialogDescription>
          {initialData ? 'Update the details of your note.' : 'Fill in the details to create a new note.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="Note Title"
            disabled={isLoading}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
            placeholder="Write your note here..."
            rows={5}
            disabled={isLoading}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTags(e.target.value)}
            placeholder="e.g., work, personal, important"
            disabled={isLoading}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onFinished} disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Note')}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default NoteForm;