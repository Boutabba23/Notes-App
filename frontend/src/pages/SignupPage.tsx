// src/pages/SignupPage.tsx
import React, { useState } from 'react';
import {  Link } from 'react-router-dom';
// import { useAuthStore } from '../store/authStore'; // Not strictly needed if signup goes via Google
// import { signupUser } from '../services/authService'; // For traditional email/password signup
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import toast from 'react-hot-toast';
// import { AuthResponse, ApiErrorResponse } from '@/types'; // For traditional signup
// import { AxiosError } from 'axios'; // For traditional signup

// Import for Google Icon and API URL
import { FaGoogle } from 'react-icons/fa'; // Make sure you've run: npm install react-icons
import { API_URL } from '@/config';

function SignupPage() {
  const [username, setUsername] = useState<string>(''); // Keep if you have a separate username step after Google auth, or remove
  const [email, setEmail] = useState<string>('');     // Keep for traditional form, or remove
  const [password, setPassword] = useState<string>(''); // Keep for traditional form, or remove
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // const navigate = useNavigate(); // Keep if traditional form is present
  // const { signup: signupToStore } = useAuthStore(); // For traditional signup

  // Handler for traditional Email/Password Signup
  const handleEmailPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // If you are keeping email/password signup, this logic remains:
    // For "Gmail only", you would remove this or comment it out.
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    setIsSubmitting(true);
    try {
      // const data: AuthResponse = await signupUser({ username, email, password });
      // const { token, ...userData } = data;
      // signupToStore(userData, token);
      // toast.success('Account created successfully! Logging you in...');
      // navigate('/');
      console.log("Traditional signup submitted - implement if needed");
      toast("Email/Password signup is placeholder."); // Placeholder
    } catch (error) {
      // const axiosError = error as AxiosError<ApiErrorResponse>;
      // console.error("Signup error:", axiosError.response?.data?.message || axiosError.message);
      // toast.error(axiosError.response?.data?.message || 'Failed to create account.');
      console.error("Traditional signup error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for Google Signup/Login
  const handleGoogleSignup = () => {
    // Redirect to your backend's Google auth route.
    // This is the same flow as Google Login. Your backend handles
    // creating a new user if they don't exist, or logging them in if they do.
    setIsSubmitting(true); // Optional: show loading state
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
          {/* Google Signup Button */}
          <Button variant="outline" className="w-full" onClick={handleGoogleSignup} disabled={isSubmitting}>
            <FaGoogle className="mr-2 h-4 w-4" /> Sign up with Google
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

          {/* Email/Password Signup Form (Keep or remove based on "Gmail only" decision) */}
          <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username-signup">Username</Label> {/* Ensure unique ID if also on login page */}
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