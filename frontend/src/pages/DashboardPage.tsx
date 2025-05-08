// src/pages/DashboardPage.tsx
import { useAuthStore } from '../store/authStore';
import * as noteService from '../services/noteService'; // Import all from service
import type { Note, ApiErrorResponse } from '@/types';
import type { NoteInput } from '@/services/noteService'; // Import NoteInput

import NoteCard from '../components/notes/NoteCard';
import NoteForm from '../components/notes/NoteForm';
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import toast from 'react-hot-toast';
import { PlusCircle, Loader2 } from 'lucide-react';
import { AxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';


function DashboardPage() {
  const { user } = useAuthStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [noteToDeleteId, setNoteToDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // For form and delete operations

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedNotes = await noteService.getNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error("Failed to fetch notes:", axiosError.response?.data?.message || axiosError.message);
      toast.error(axiosError.response?.data?.message || "Could not load your notes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) { // Only fetch notes if user is logged in
        fetchNotes();
    }
  }, [fetchNotes, user]);

  const handleOpenForm = (note: Note | null = null) => {
    setCurrentNote(note);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentNote(null);
  };

  const handleFormSubmit = async (noteData: NoteInput) => {
    setIsSubmitting(true); // Use this for the form's internal loading state if needed, or rely on NoteForm's
    try {
      if (currentNote && currentNote._id) {
        const updatedNote = await noteService.updateNote(currentNote._id, noteData);
        setNotes(notes.map(n => n._id === updatedNote._id ? updatedNote : n).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        toast.success("Note updated successfully!");
      } else {
        const newNote = await noteService.createNote(noteData);
        setNotes([newNote, ...notes].sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
        toast.success("Note created successfully!");
      }
      handleCloseForm();
    } catch (error) {
        // Error is handled by NoteForm's toast for now, or add more specific here
        const axiosError = error as AxiosError<ApiErrorResponse>;
        console.error("Dashboard form submit error:", axiosError.response?.data?.message || axiosError.message);
        toast.error(axiosError.response?.data?.message || "Operation failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  const openDeleteConfirm = (noteId: string) => {
    setNoteToDeleteId(noteId);
  };

  const closeDeleteConfirm = () => {
    setNoteToDeleteId(null);
  };

  const handleDeleteNote = async () => {
    if (!noteToDeleteId) return;
    setIsSubmitting(true);
    try {
      await noteService.deleteNote(noteToDeleteId);
      setNotes(notes.filter(n => n._id !== noteToDeleteId));
      toast.success("Note deleted successfully!");
      closeDeleteConfirm();
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error("Failed to delete note:", axiosError.response?.data?.message || axiosError.message);
      toast.error(axiosError.response?.data?.message || "Could not delete the note.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && notes.length === 0) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading your notes...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Notes</h1>
          {user && <p className="text-muted-foreground">Welcome back, {user.username}!</p>}
        </div>
        <Dialog open={isFormOpen} onOpenChange={(openState) => {
            setIsFormOpen(openState);
            if (!openState) setCurrentNote(null); // Reset currentNote when dialog closes
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Note
            </Button>
          </DialogTrigger>
          {/* Conditionally render Form to reset its internal state, or pass a key */}
          {isFormOpen && (
            <NoteForm
              onSubmit={handleFormSubmit}
              initialData={currentNote}
              onFinished={handleCloseForm}
            />
          )}
        </Dialog>
      </div>

      {isLoading && notes.length > 0 && (
        <div className="flex justify-center my-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {!isLoading && notes.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground mb-4">You don't have any notes yet.</p>
          <Button onClick={() => handleOpenForm(null)} size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onEdit={() => handleOpenForm(note)}
              onDelete={() => openDeleteConfirm(note._id)}
            />
          ))}
        </div>
      )}

      <AlertDialog open={!!noteToDeleteId} onOpenChange={(isOpen) => !isOpen && closeDeleteConfirm()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteConfirm} disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Deleting...' : 'Yes, delete it'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default DashboardPage;