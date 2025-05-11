// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { loginUser } from '../services/authService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast as sonnerToast } from 'sonner';
import type { AuthResponse, ApiErrorResponse } from '@/types';
import { AxiosError } from 'axios';
import { API_URL } from '@/config';

// Import the background image
import loginPageImage from '@/assets/login-image.svg'; // Adjust path and extension if needed

function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login: loginToStore } = useAuthStore();

  const handleEmailPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data: AuthResponse = await loginUser({ email, password });
      const { token, ...userData } = data;
      loginToStore(userData, token);
      sonnerToast.success('Logged in successfully!');
      navigate('/');
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error("Login error:", axiosError.response?.data?.message || axiosError.message);
      sonnerToast.error(axiosError.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsSubmitting(true);
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    // Main container for the two-column layout, covering full height
    <div className="flex min-h-screen bg-gray-50"> {/* Or your desired overall page background */}

      {/* Left Column: Login Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col items-center justify-start  "> {/* Responsive width */}
        <Card className="w-full max-w-md shadow-xl"> {/* Added shadow for better separation */}
          <CardHeader className="text-center"> {/* Centered header content */}
            <Link to="/" className="inline-block mb-6">
                {/* You can put your app logo here if you have one */}
                {/* <img src="/path-to-your-logo.svg" alt="NotesApp Logo" className="h-10 mx-auto" /> */}
                <h1 className="text-3xl font-bold text-primary">EasyNotes</h1>
            </Link>
            <CardTitle className="text-2xl">Welcome Back!</CardTitle>
            <CardDescription>
              Sign in to continue to your notes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full flex items-center hover:cursor-pointer justify-center gap-2 py-2.5" onClick={handleGoogleLogin} disabled={isSubmitting}>
             <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" fill-rule="evenodd">
    <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9.1818v3.4818h4.7909c-.2045.9954-.8136 2.0181-1.9091 2.7954v2.2681h2.9091c1.7045-1.5681 2.6864-3.8727 2.6864-6.7045z" fill="#4285F4"/>
    <path d="M9.1818 18c2.4455 0 4.4955-.8091 5.9955-2.1818l-2.9091-2.2681c-.8091.5454-1.8409.8727-3.0864.8727-2.3591 0-4.3636-1.5864-5.0864-3.7091H1.0909v2.3318C2.5864 16.0955 5.6318 18 9.1818 18z" fill="#34A853"/>
    <path d="M4.0955 10.7318c-.1909-.5454-.3-.9681-.3-1.4954s.1091-.95.3-1.4954V5.4091H1.0909C.4273 6.65.0091 8.0045.0091 9.2364c0 1.2318.4182 2.5863 1.0818 3.8318l3-2.3364z" fill="#FBBC05"/>
    <path d="M9.1818 3.5955c1.3227 0 2.5181.4591 3.4545 1.3636l2.5864-2.5864C13.6727.8318 11.6227 0 9.1818 0 5.6318 0 2.5864 1.9045 1.0909 4.7318L4.0955 7.068c.7227-2.1227 2.7273-3.709 5.0864-3.709z" fill="#EA4335"/>
  </g>
</svg>
              Continue with Google
            </Button>

            <div className="relative my-6"> {/* Increased margin */}
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground"> {/* Changed bg to bg-card for better theme adapt */}
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-secondary hover:cursor-pointer text-primary-foreground" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm"> {/* Centered footer */}
            Don't have an account?
            <Button variant="link" asChild className="pl-1 text-primary">
              <Link to="/signup">Sign up</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Right Column: Image */}
      {/* Hidden on small screens (md:block) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/6 items-center justify-center p-8 bg-gray-50 relative overflow-hidden"> {/* Light tint of primary or another contrasting bg */}
        <img
          src={loginPageImage}
          alt="Person writing notes with inspiration from the sea"
          className="object-contain max-h-full max-w-full rounded-lg" // object-contain to fit image within bounds without cropping
        />
        {/* You could add decorative elements here if desired */}
      </div>
    </div>
  );
}

export default LoginPage;