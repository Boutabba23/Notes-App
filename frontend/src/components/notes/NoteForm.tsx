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

// Import Sonner's toast function
import { toast as sonnerToast } from 'sonner'; // Or your preferred alias

import type { Note, ApiErrorResponse } from '@/types';
import type { NoteInput } from '@/services/noteService';
import { AxiosError } from 'axios';

interface NoteFormProps {
  onSubmit: (noteData: NoteInput) => Promise<void>;
  initialData?: Note | null;
  onFinished: () => void; // To close dialog or refresh (called by parent on success/cancel)
}

function NoteForm({ onSubmit, initialData, onFinished }: NoteFormProps) {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [tags, setTags] = useState<string>('');
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
    if (!title.trim()) { // Simplified: just check title as content can sometimes be optional depending on use case
      sonnerToast.error("Title cannot be empty.");
      return;
    }
    if (!content.trim()) { // Added check for content as well
      sonnerToast.error("Content cannot be empty.");
      return;
    }

    setIsLoading(true);
    try {
      const noteData: NoteInput = {
        title,
        content,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      };
      await onSubmit(noteData); // Call the parent's onSubmit logic
      // The parent component (App.tsx's handleGlobalNoteFormSubmit) is now responsible for:
      // 1. Showing the success toast.
      // 2. Calling onFinished (which is closeNoteForm from uiStore) to close the dialog.
      // 3. Triggering a refresh of the notes list.
    } catch (error) {
      // This catch block will now primarily handle errors thrown by onSubmit if the parent re-throws,
      // or if there's an unexpected error within this component before calling onSubmit.
      // The primary error handling for API calls is now in App.tsx's handleGlobalNoteFormSubmit.
      const axiosError = error as AxiosError<ApiErrorResponse>; // Type assertion
      console.error("Note form submission error propagated to NoteForm:", axiosError.response?.data?.message || (error as Error).message);
      // Display a generic error here, or let the parent handle it.
      // If parent handles it, this toast might be redundant.
      // For now, let's assume parent handles API error toasts.
      // sonnerToast.error(axiosError.response?.data?.message || "Failed to save note. Error in form.");
    } finally {
      setIsLoading(false);
      // We don't call onFinished() here on success anymore because the parent (App.tsx)
      // will call it after its own success toast and refresh logic.
      // onFinished() is still used by the "Cancel" button directly.
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
          <Label htmlFor="title-noteform">Title</Label> {/* Unique ID for label */}
          <Input
            id="title-noteform"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            placeholder="Note Title"
            disabled={isLoading}
            className='bg-gray-50'
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content-noteform">Content</Label> {/* Unique ID for label */}
          <Textarea
            id="content-noteform"
            value={content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
            placeholder="Write your note here..."
            rows={5}
            disabled={isLoading}
            className='bg-gray-50 min-h-[120px] max-h-[200px] resize-y overflow-y-auto'
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags-noteform">Tags (comma-separated)</Label> {/* Unique ID for label */}
          <Input
            id="tags-noteform"
            className='bg-gray-50'
            value={tags}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTags(e.target.value)}
            placeholder="e.g., work, personal, important"
            disabled={isLoading}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" className='hover:cursor-pointer' variant="outline" onClick={onFinished} disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" className='hover:cursor-pointer hover:bg-secondary'  disabled={isLoading}>
            {isLoading ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Note')}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default NoteForm;