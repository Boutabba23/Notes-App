// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { loginUser } from '../services/authService'; // For email/password login
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import toast from 'react-hot-toast';
import type { AuthResponse, ApiErrorResponse } from '@/types';
import { AxiosError } from 'axios';


// Import for Google Icon and API URL
import { FaGoogle } from 'react-icons/fa'; // Make sure to run: npm install react-icons
import { API_URL } from '@/config';

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
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error("Login error:", axiosError.response?.data?.message || axiosError.message);
      toast.error(axiosError.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for Google Login
  const handleGoogleLogin = () => {
    // Redirect to your backend's Google auth route
    // Ensure API_URL from src/config.ts is correctly pointing to your backend (local or deployed)
    setIsSubmitting(true); // Optional: show loading state
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]"> {/* Adjust min-height if needed */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Sign in with your Google account or enter your email below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Login Button */}
          <Button variant="outline" className="w-full" onClick={handleGoogleLogin} disabled={isSubmitting}>
            <FaGoogle className="mr-2 h-4 w-4" /> Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Email/Password Form (Keep or remove based on "Gmail only" decision) */}
          <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login with Email'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm">
          {/* Link to SignupPage can be conditional or removed if truly "Gmail only" */}
          Don't have an account? <Button variant="link" asChild className="pl-1"><Link to="/signup">Sign up</Link></Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default LoginPage;