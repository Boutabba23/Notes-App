// src/store/uiStore.ts
import { create } from 'zustand';
import type { Note } from '@/types'; // Assuming Note type is in '@/types'

interface NoteFormDialogState {
  isNoteFormOpen: boolean;
  currentEditingNote: Note | null; // To pass data if editing
  openNoteForm: (noteToEdit?: Note | null) => void;
  closeNoteForm: () => void;
}

export const useUIStore = create<NoteFormDialogState>((set) => ({
  isNoteFormOpen: false,
  currentEditingNote: null,
  openNoteForm: (noteToEdit = null) => set({ isNoteFormOpen: true, currentEditingNote: noteToEdit }),
  closeNoteForm: () => set({ isNoteFormOpen: false, currentEditingNote: null }),
}));