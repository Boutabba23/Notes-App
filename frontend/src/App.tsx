// src/App.tsx
import React, { useEffect, useCallback } from 'react'; // Added useCallback
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore'; // Import UI Store
import { getMe as fetchCurrentUser } from './services/authService';
import * as noteService from './services/noteService'; // For note operations
import type { NoteInput } from './services/noteService';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import Navbar from './components/layout/Navbar';
import { Loader2 } from 'lucide-react';

// Import Dialog and NoteForm components
import { Dialog } from "@/components/ui/dialog";
import NoteForm from "./components/notes/NoteForm"; // Adjust path if necessary
import toast from 'react-hot-toast'; // For success/error toasts
import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types';
import AuthCallbackPage from './pages/AuthCallbackPage';


// ... (ProtectedRoute remains the same)
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

  // State for notes needs to be managed here or in a dedicated notes store
  // to allow DashboardPage and NoteForm submission to interact with it.
  // For simplicity, we'll manage a "refreshNotes" trigger.
  // A more robust solution would be a dedicated notes store (e.g., with Zustand).
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const triggerRefreshNotes = () => setRefreshTrigger(prev => prev + 1);


  useEffect(() => {
    // ... (verifyUserOnLoad logic from previous step)
    const verifyUserOnLoad = async () => {
      if (token && !user) { // Check if user object is not yet set
        setAuthLoading(true);
        try {
          const userData = await fetchCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Token verification failed on app load:", error);
          logout();
        }
        // No finally setAuthLoading(false) here, setUser in authStore handles it
      } else if (!token) {
        // If no token, ensure auth loading is false (if it was somehow true)
         if (isLoading) setAuthLoading(false);
      }
    };
    verifyUserOnLoad();
  }, [token, user, setUser, logout, setAuthLoading, isLoading]);


  const handleGlobalNoteFormSubmit = useCallback(async (noteData: NoteInput) => {
    // This function will be passed to the globally rendered NoteForm
    try {
      if (currentEditingNote && currentEditingNote._id) {
        await noteService.updateNote(currentEditingNote._id, noteData);
        toast.success("Note updated successfully!");
      } else {
        await noteService.createNote(noteData);
        toast.success("Note created successfully!");
      }
      closeNoteForm();
      triggerRefreshNotes(); // Tell DashboardPage to re-fetch notes
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error("Global note form submit error:", axiosError.response?.data?.message || axiosError.message);
      toast.error(axiosError.response?.data?.message || "Failed to save note.");
      // Optionally, don't close the form on error, or re-throw to let NoteForm handle its loading state
    }
  }, [currentEditingNote, closeNoteForm]);

  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Navbar />
      <div className="container mx-auto p-4 mt-16">
        <Routes>
          <Route path="/login" element={isAuthenticated && !isLoading ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/signup" element={isAuthenticated && !isLoading ? <Navigate to="/" /> : <SignupPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} /> {/* ADD THIS */}

          <Route
            path="/"
            element={
              <ProtectedRoute>
                {/* Pass the refreshTrigger to DashboardPage so it can re-fetch notes */}
                <DashboardPage key={refreshTrigger} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={isAuthenticated && !isLoading ? "/" : "/login"} />} />
        </Routes>
      </div>

      {/* Global Note Form Dialog */}
      <Dialog open={isNoteFormOpen} onOpenChange={(open) => {
        if (!open) closeNoteForm();
      }}>
        {/* Render NoteForm only when dialog is supposed to be open to ensure state resets properly */}
        {isNoteFormOpen && (
            <NoteForm
            onSubmit={handleGlobalNoteFormSubmit}
            initialData={currentEditingNote}
            onFinished={closeNoteForm} // For cancel button
            />
        )}
      </Dialog>
    </Router>
  );
}

export default App;