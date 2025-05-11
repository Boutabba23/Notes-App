// src/App.tsx
import React, { useEffect, useCallback, useState } from 'react'; // Added useState for refreshTrigger
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';
import { getMe as fetchCurrentUser } from './services/authService';
import * as noteService from './services/noteService';
import type { NoteInput } from './services/noteService'; // Ensure this type is correctly defined
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import Navbar from './components/layout/Navbar';
import { Loader2 } from 'lucide-react';
import { Dialog } from "@/components/ui/dialog";
import NoteForm from "./components/notes/NoteForm";
import AuthCallbackPage from './pages/AuthCallbackPage';

// --- Sonner Imports ---
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner'; // Correct import for triggering toasts
// If you used `npx shadcn-ui@latest add sonner`, you might use the shadcn/ui wrapper for <Toaster />
// import { Toaster as ShadCNToaster } from "@/components/ui/sonner"; // Use this if you prefer the shadcn wrapper

import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types';


interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading application...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}


function App() {
  const { isAuthenticated, isLoading, token, user, setUser, logout, setIsLoading: setAuthLoading } = useAuthStore();
  const { isNoteFormOpen, currentEditingNote, closeNoteForm } = useUIStore();
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Changed to useState

  // Memoize triggerRefreshNotes to prevent unnecessary re-renders if passed as prop
  const triggerRefreshNotes = useCallback(() => setRefreshTrigger(prev => prev + 1), []);


  useEffect(() => {
    const verifyUserOnLoad = async () => {
      if (token && !user) {
        setAuthLoading(true);
        try {
          const userData = await fetchCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Token verification failed on app load:", error);
          logout();
        }
      } else if (!token && isLoading) { // Ensure loading is false if no token and was loading
         setAuthLoading(false);
      }
    };
    verifyUserOnLoad();
  }, [token, user, setUser, logout, setAuthLoading, isLoading]);


  const handleGlobalNoteFormSubmit = useCallback(async (noteData: NoteInput) => {
    try {
      if (currentEditingNote && currentEditingNote._id) {
        await noteService.updateNote(currentEditingNote._id, noteData);
        sonnerToast.success("Note updated successfully!"); // Use sonnerToast.success()
      } else {
        await noteService.createNote(noteData);
        sonnerToast.success("Note created successfully!"); // Use sonnerToast.success()
      }
      closeNoteForm();
      triggerRefreshNotes();
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error("Global note form submit error:", axiosError.response?.data?.message || axiosError.message);
      sonnerToast.error(axiosError.response?.data?.message || "Failed to save note."); // Use sonnerToast.error()
    }
  }, [currentEditingNote, closeNoteForm, triggerRefreshNotes]); // Added triggerRefreshNotes

  return (
    <Router>
      {/* Sonner's Toaster component - place it high in your component tree */}
      {/* If using shadcn/ui wrapper: <ShadCNToaster richColors position="top-right" /> */}
      <SonnerToaster richColors position="bottom-right" />

      <Navbar />
      <div className="container mx-auto p-4 mt-16 min-h-[calc(100vh-4rem)] bg-gray-50"> {/* Ensure bg covers area */}
        <Routes>
          <Route path="/login" element={isAuthenticated && !isLoading ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/signup" element={isAuthenticated && !isLoading ? <Navigate to="/" /> : <SignupPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage key={refreshTrigger} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={isAuthenticated && !isLoading ? "/" : "/login"} />} />
        </Routes>
      </div>

      <Dialog open={isNoteFormOpen} onOpenChange={(open) => { if (!open) closeNoteForm(); }}>
        {isNoteFormOpen && (
            <NoteForm
            onSubmit={handleGlobalNoteFormSubmit}
            initialData={currentEditingNote}
            onFinished={closeNoteForm}
            />
        )}
      </Dialog>
    </Router>
  );
}

export default App;