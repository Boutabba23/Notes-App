// src/services/noteService.ts
import api from './api';
import type { Note } from '@/types'; // Using path alias

// Type for data when creating/updating a note (user ID is handled by backend via token)
export interface NoteInput {
  title: string;
  content: string;
  tags?: string[]; // Optional, defaults to empty array on backend if not provided
}

export const getNotes = async (): Promise<Note[]> => {
  const response = await api.get<Note[]>('/notes');
  return response.data;
};

export const createNote = async (noteData: NoteInput): Promise<Note> => {
  const response = await api.post<Note>('/notes', noteData);
  return response.data;
};

export const updateNote = async (noteId: string, noteData: Partial<NoteInput>): Promise<Note> => {
  // Using Partial<NoteInput> because user might only update title or content, etc.
  const response = await api.put<Note>(`/notes/${noteId}`, noteData);
  return response.data;
};

export const deleteNote = async (noteId: string): Promise<{ id: string; message: string }> => {
  // Backend returns { id: req.params.id, message: 'Note removed' }
  const response = await api.delete<{ id: string; message: string }>(`/notes/${noteId}`);
  return response.data;
};