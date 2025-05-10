// src/pages/AuthCallbackPage.tsx
import  { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getMe } from '../services/authService'; // To fetch user data with the new token
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

function AuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login: loginToStore } = useAuthStore();
  const processing = useRef(false);

  useEffect(() => {
    if (processing.current) return;
    processing.current = true;

    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');

    const processToken = async (token: string) => {
      try {
        useAuthStore.setState({ token, isAuthenticated: true, user: null, isLoading: true });
        const userDataFromBackend = await getMe(); // Uses the token via Axios interceptor
        loginToStore(userDataFromBackend, token); // Final login with user data
        toast.success('Logged in successfully with Google!');
        navigate('/');
      } catch (error) {
        console.error("Error processing Google auth token:", error);
        toast.error('Failed to complete Google login.');
        useAuthStore.getState().logout();
        navigate('/login');
      }
    };

    if (tokenFromUrl) {
      processToken(tokenFromUrl);
    } else {
      toast.error('Google authentication failed: No token received.');
      navigate('/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, navigate, loginToStore]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg">Finalizing login...</p>
    </div>
  );
}
export default AuthCallbackPage;