// src/pages/DashboardPage.tsx
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore'; // To get searchTerm and openNoteForm action
import * as noteService from '../services/noteService';
import type { Note, ApiErrorResponse } from '@/types';
// NoteInput is primarily used by the global NoteForm, not directly here for form submission logic

import NoteCard from '../components/notes/NoteCard';
import { Button } from "@/components/ui/button";
// Input component for search is no longer here; it's in Navbar.tsx
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
import { PlusCircle, Loader2 } from 'lucide-react'; // Search icon is not needed here
import { AxiosError } from 'axios';

function DashboardPage() {
  const { user } = useAuthStore();
  // Get searchTerm from the global UI store to filter notes.
  // openNoteForm is used for the "Create Note" button on this page and for editing notes.
  const { openNoteForm, searchTerm } = useUIStore();

  const [allNotes, setAllNotes] = useState<Note[]>([]); // Stores all notes fetched from the backend
  const [isLoading, setIsLoading] = useState<boolean>(true); // For loading notes state
  const [noteToDeleteId, setNoteToDeleteId] = useState<string | null>(null); // ID of note to be deleted
  const [isDeleting, setIsDeleting] = useState<boolean>(false); // Loading state for delete operation

  // Callback to fetch all notes for the current user
  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedNotes = await noteService.getNotes();
      // Sort notes by updatedAt in descending order (newest first)
      setAllNotes(fetchedNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error("Failed to fetch notes:", axiosError.response?.data?.message || axiosError.message);
      toast.error(axiosError.response?.data?.message || "Could not load your notes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // useEffect to fetch notes when the component mounts or when the user changes.
  // The `key` prop on DashboardPage in App.tsx (driven by refreshTrigger) will also cause
  // this to run on remount, effectively re-fetching notes.
  useEffect(() => {
    if (user) { // Only fetch if a user is logged in
        fetchNotes();
    }
  }, [fetchNotes, user]); // Dependencies: fetchNotes callback and user object

  // Memoized array of notes filtered by the searchTerm from the global UI store
  const filteredNotes = useMemo(() => {
    if (!searchTerm.trim()) {
      return allNotes; // If no search term, return all notes
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    // Filter notes based on title, content, or tags containing the search term
    return allNotes.filter(note =>
      note.title.toLowerCase().includes(lowercasedSearchTerm) ||
      note.content.toLowerCase().includes(lowercasedSearchTerm) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(lowercasedSearchTerm)))
    );
  }, [allNotes, searchTerm]); // Dependencies: allNotes array and the global searchTerm

  // Functions for delete confirmation dialog
  const openDeleteConfirm = (noteId: string) => {
    setNoteToDeleteId(noteId);
  };

  const closeDeleteConfirm = () => {
    setNoteToDeleteId(null);
  };

  // Function to handle the actual deletion of a note
  const handleDeleteNote = async () => {
    if (!noteToDeleteId) return;
    setIsDeleting(true);
    try {
      await noteService.deleteNote(noteToDeleteId);
      toast.success("Note deleted successfully!");
      closeDeleteConfirm();
      fetchNotes(); // Re-fetch notes from the server to update the list accurately
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error("Failed to delete note:", axiosError.response?.data?.message || axiosError.message);
      toast.error(axiosError.response?.data?.message || "Could not delete the note.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Page Header: Title and Create Note button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Notes</h1>
          {user && <p className="text-muted-foreground">Welcome back, {user.username}!</p>}
        </div>
        {/* The search input is now in Navbar.tsx */}
        <Button onClick={() => openNoteForm(null)} className="flex-shrink-0">
          <PlusCircle className="mr-2 h-4 w-4" /> Create Note
        </Button>
      </div>

      {/* Loading state: Displayed when initially fetching notes */}
      {isLoading && allNotes.length === 0 && (
        <div className="flex justify-center items-center h-[calc(100vh-15rem)]"> {/* Adjusted height for better centering */}
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">Loading your notes...</p>
        </div>
      )}

      {/* No notes state: Displayed if loading is done, no notes exist, and no search term is active */}
      {!isLoading && allNotes.length === 0 && !searchTerm.trim() && (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground mb-4">You don't have any notes yet.</p>
          <Button onClick={() => openNoteForm(null)} size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Note
          </Button>
        </div>
      )}

      {/* No search results state: Displayed if a search term is active but yields no results */}
      {!isLoading && allNotes.length > 0 && filteredNotes.length === 0 && searchTerm.trim() && (
         <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">No notes found matching "{searchTerm}".</p>
        </div>
      )}

      {/* Notes Grid: Display filtered notes if any exist */}
      {filteredNotes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onEdit={(noteToEdit) => openNoteForm(noteToEdit)} // Uses global UI store action to open NoteForm
              onDelete={() => openDeleteConfirm(note._id)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!noteToDeleteId} onOpenChange={(isOpen) => { if (!isOpen) closeDeleteConfirm(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDeleteConfirm} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNote} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isDeleting ? 'Deleting...' : 'Yes, delete it'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default DashboardPage;