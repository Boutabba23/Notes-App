// src/pages/SignupPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Import Sonner's toast function
import { toast as sonnerToast } from 'sonner'; // Or your preferred alias

import type { AuthResponse, ApiErrorResponse } from '@/types';
import { AxiosError } from 'axios';
import { API_URL } from '@/config';
import { useAuthStore } from '@/store/authStore';
import { signupUser } from '@/services/authService'; // For traditional email/password signup

function SignupPage() {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const { signup: signupToStore } = useAuthStore();

  const handleEmailPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.length < 6) {
      // Use Sonner for error toast
      sonnerToast.error("Password must be at least 6 characters long.");
      return;
    }
    setIsSubmitting(true);
    try {
      const data: AuthResponse = await signupUser({ username, email, password });
      const { token, ...userData } = data;
      signupToStore(userData, token);
      // Use Sonner for success toast
      sonnerToast.success('Account created successfully! Logging you in...');
      navigate('/');
      // The placeholder toast below can be removed or updated if this form is actively used
      // console.log("Traditional signup submitted - implement if needed");
      // sonnerToast("Email/Password signup is placeholder."); // Example of default sonner toast
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error("Signup error:", axiosError.response?.data?.message || axiosError.message);
      // Use Sonner for error toast
      sonnerToast.error(axiosError.response?.data?.message || 'Failed to create account.');
      // console.error("Traditional signup error:", error); // Covered by the line above
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = () => {
    setIsSubmitting(true);
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Sign up with Google or fill in the details below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" onClick={handleGoogleSignup} disabled={isSubmitting}>
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" fill-rule="evenodd">
    <path d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9.1818v3.4818h4.7909c-.2045.9954-.8136 2.0181-1.9091 2.7954v2.2681h2.9091c1.7045-1.5681 2.6864-3.8727 2.6864-6.7045z" fill="#4285F4"/>
    <path d="M9.1818 18c2.4455 0 4.4955-.8091 5.9955-2.1818l-2.9091-2.2681c-.8091.5454-1.8409.8727-3.0864.8727-2.3591 0-4.3636-1.5864-5.0864-3.7091H1.0909v2.3318C2.5864 16.0955 5.6318 18 9.1818 18z" fill="#34A853"/>
    <path d="M4.0955 10.7318c-.1909-.5454-.3-.9681-.3-1.4954s.1091-.95.3-1.4954V5.4091H1.0909C.4273 6.65.0091 8.0045.0091 9.2364c0 1.2318.4182 2.5863 1.0818 3.8318l3-2.3364z" fill="#FBBC05"/>
    <path d="M9.1818 3.5955c1.3227 0 2.5181.4591 3.4545 1.3636l2.5864-2.5864C13.6727.8318 11.6227 0 9.1818 0 5.6318 0 2.5864 1.9045 1.0909 4.7318L4.0955 7.068c.7227-2.1227 2.7273-3.709 5.0864-3.709z" fill="#EA4335"/>
  </g>
</svg> Sign up with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or create an account with email
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username-signup">Username</Label>
              <Input
                id="username-signup"
                type="text"
                placeholder="yourusername"
                required
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-signup">Email</Label>
              <Input
                id="email-signup"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-signup">Password</Label>
              <Input
                id="password-signup"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account with Email'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm">
          Already have an account? <Button variant="link" asChild className="pl-1"><Link to="/login">Login</Link></Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default SignupPage;