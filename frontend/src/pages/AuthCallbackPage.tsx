// src/pages/AuthCallbackPage.tsx
import  { useEffect, useRef } from 'react'; // Added React for type on processing.current if needed, though not strictly required for useRef<boolean>
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getMe } from '../services/authService';

// Import Sonner's toast function
import { toast as sonnerToast } from 'sonner'; // Or your preferred alias

import { Loader2 } from 'lucide-react';

function AuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login: loginToStore } = useAuthStore();
  const processing = useRef<boolean>(false); // Explicitly type useRef if React is imported

  useEffect(() => {
    if (processing.current) return; // Prevent double execution, especially in StrictMode
    processing.current = true;

    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');

    const processToken = async (token: string) => {
      try {
        // 1. Set the token in the store so getMe() can use it via the Axios interceptor
        // This is a temporary measure. The final state will be set by loginToStore.
        useAuthStore.setState({ token, isAuthenticated: true, user: null, isLoading: true });

        // 2. Fetch the user details from your backend using the new token
        const userDataFromBackend = await getMe();

        // 3. Properly log in with full user data and the token
        loginToStore(userDataFromBackend, token);

        // Use Sonner for success toast
        sonnerToast.success('Logged in successfully with Google!');
        navigate('/'); // Redirect to dashboard or home
      } catch (error) {
        console.error("Error processing Google auth token:", error);
        // Use Sonner for error toast
        sonnerToast.error('Failed to complete Google login. Please try again.');
        useAuthStore.getState().logout(); // Ensure user is logged out on error
        navigate('/login');
      }
    };

    if (tokenFromUrl) {
      // console.log("AuthCallbackPage: Received token from URL:", tokenFromUrl); // Optional debug log
      processToken(tokenFromUrl);
    } else {
      // console.error("AuthCallbackPage: No token found in URL after Google auth."); // Optional debug log
      // Use Sonner for error toast
      sonnerToast.error('Google authentication failed: No token received.');
      navigate('/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, navigate, loginToStore]); // Dependencies for useEffect

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground">Finalizing your login...</p> {/* Used text-muted-foreground for consistency */}
    </div>
  );
}
export default AuthCallbackPage;