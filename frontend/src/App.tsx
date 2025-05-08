// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { getMe as fetchCurrentUser } from './services/authService';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import Navbar from './components/layout/Navbar';
import { Loader2 } from 'lucide-react';

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
  return <>{children}</>; // Return children wrapped in a fragment or directly
}

function App() {
  const { isAuthenticated, isLoading, token, setUser, logout, setIsLoading: setAuthLoading } = useAuthStore();

  useEffect(() => {
    const verifyUserOnLoad = async () => {
      if (token && !isAuthenticated) { // Only run if token exists but user session isn't confirmed
        setAuthLoading(true);
        try {
          const userData = await fetchCurrentUser();
          setUser(userData); // This will also set isAuthenticated and isLoading to false
        } catch (error) {
          console.error("Token verification failed on app load:", error);
          logout(); // Clears token and user, sets isAuthenticated to false
        } finally {
           // setUser or logout already sets isLoading to false
        }
      } else {
        // If no token, or already authenticated, ensure loading is false.
        // Zustand's onRehydrateStorage or initial state handles this for persisted state.
        // If not relying on persisted state for initial check, then:
         if (isLoading) setAuthLoading(false);
      }
    };

    verifyUserOnLoad();
  }, [token, isAuthenticated, setUser, logout, setAuthLoading, isLoading]);


  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Navbar />
      <div className="container mx-auto p-4 mt-16">
        <Routes>
          <Route path="/login" element={isAuthenticated && !isLoading ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/signup" element={isAuthenticated && !isLoading ? <Navigate to="/" /> : <SignupPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={isAuthenticated && !isLoading ? "/" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;