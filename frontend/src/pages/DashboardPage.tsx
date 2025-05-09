// src/pages/DashboardPage.tsx
import  { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore'; // Import the new UI store
import * as noteService from '../services/noteService';
import type {ApiErrorResponse}  from '@/types';
import type { Note } from '@/types';

import NoteCard from '../components/notes/NoteCard';
// NoteForm will be rendered globally or in App.tsx now
// import NoteForm from '../components/notes/NoteForm';
import { Button } from "@/components/ui/button";
// Dialog and DialogTrigger for the button on this page will still exist,
// but the Dialog component containing NoteForm will be global.
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

function DashboardPage() {
  const { user } = useAuthStore();
  // UI store will manage the form's open state and current note for editing
  const { openNoteForm } = useUIStore(); // Get the action to open the form

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [noteToDeleteId, setNoteToDeleteId] = useState<string | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState<boolean>(false); // Renamed for clarity

  const fetchNotes = useCallback(async () => {
    // ... (fetchNotes logic remains the same)
    setIsLoading(true);
    try {
      const fetchedNotes = await noteService.getNotes();
      setNotes(fetchedNotes.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error("Failed to fetch notes:", axiosError.response?.data?.message || axiosError.message);
      toast.error(axiosError.response?.data?.message || "Could not load your notes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
        fetchNotes();
    }
  }, [fetchNotes, user]);

  // handleFormSubmit will be passed to the global NoteForm via App.tsx
  // It needs to be accessible globally or passed down.
  // For now, we'll define it here and assume it can be called.
  // This part will require careful wiring in App.tsx.

  const openDeleteConfirm = (noteId: string) => {
    setNoteToDeleteId(noteId);
  };

  const closeDeleteConfirm = () => {
    setNoteToDeleteId(null);
  };

  const handleDeleteNote = async () => {
    // ... (handleDeleteNote logic remains the same)
    if (!noteToDeleteId) return;
    setIsSubmittingDelete(true);
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
      setIsSubmittingDelete(false);
    }
  };

  // ... (loading states and JSX remain similar, but the Dialog for NoteForm is removed)

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Notes</h1>
          {user && <p className="text-muted-foreground">Welcome back, {user.username}!</p>}
        </div>
        {/* This button now just calls the global store action */}
        <Button onClick={() => openNoteForm()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create Note
        </Button>
      </div>

      {/* ... (rest of the JSX for displaying notes and delete dialog) ... */}
      {isLoading && notes.length === 0 && (
        <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" /> <p className="ml-4 text-lg">Loading your notes...</p>
        </div>
      )}

      {!isLoading && notes.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground mb-4">You don't have any notes yet.</p>
          <Button onClick={() => openNoteForm()} size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Note
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onEdit={(noteToEdit) => openNoteForm(noteToEdit)} // Pass note for editing
              onDelete={() => openDeleteConfirm(note._id)}
            />
          ))}
        </div>
      )}

      <AlertDialog open={!!noteToDeleteId} onOpenChange={(isOpen) => !isOpen && closeDeleteConfirm()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete your note.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteConfirm} disabled={isSubmittingDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote} disabled={isSubmittingDelete} className="bg-destructive hover:bg-destructive/90">
              {isSubmittingDelete && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmittingDelete ? 'Deleting...' : 'Yes, delete it'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default DashboardPage;