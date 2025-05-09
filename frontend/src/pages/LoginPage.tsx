// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { loginUser } from '../services/authService';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import toast from 'react-hot-toast';
import type { AuthResponse, ApiErrorResponse } from '@/types';
import { AxiosError } from 'axios';

function LoginPage() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login: loginToStore } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data: AuthResponse = await loginUser({ email, password });
          console.log('[LoginPage] Login API Response Data:', data); // LOG 1
  if (data && data.token) {
      // data contains _id, username, email, token. We pass the user part to loginToStore.
      const { token, ...userData } = data;
        console.log('[LoginPage] Attempting to store token:', token); // LOG 2
      console.log('[LoginPage] User data to store:', userData); // LOG 3
      
      loginToStore(userData, token);
       console.log('[LoginPage] Token SHOULD BE stored. Current store state token:', useAuthStore.getState().token); // LOG 4 - Check immediately
      toast.success('Logged in successfully!');
      navigate('/');
  }else {
      console.error('[LoginPage] Login response did not include a token:', data);
      toast.error('Login failed: No token received.');
    }
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      
      console.error("Login error:", axiosError.response?.data?.message || axiosError.message);
      toast.error(axiosError.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm">
          Don't have an account? <Button variant="link" asChild className="pl-1"><Link to="/signup">Sign up</Link></Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default LoginPage;