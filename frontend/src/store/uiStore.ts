// src/store/uiStore.ts
import { create } from 'zustand';
import type { Note } from '@/types';

interface NoteFormDialogState {
  isNoteFormOpen: boolean;
  currentEditingNote: Note | null;
  openNoteForm: (noteToEdit?: Note | null) => void;
  closeNoteForm: () => void;
}

// Add Search State
interface SearchState {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

// Combine states
type UIState = NoteFormDialogState & SearchState;

export const useUIStore = create<UIState>((set) => ({
  // NoteFormDialogState
  isNoteFormOpen: false,
  currentEditingNote: null,
  openNoteForm: (noteToEdit = null) => set({ isNoteFormOpen: true, currentEditingNote: noteToEdit }),
  closeNoteForm: () => set({ isNoteFormOpen: false, currentEditingNote: null }),

  // SearchState
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),
}));