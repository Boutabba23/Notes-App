// src/types/index.ts
export interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string | null; // <<<< ADD THIS (optional or nullable)
  createdAt?: string; // Optional from backend, select:false
  updatedAt?: string; // Optional from backend
}

export interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  token: string;
  profilePicture?: string | null; // <<<< ADD THIS if your traditional login/signup also return it

}

export interface Note {
  _id: string;
  user: string; // User ID
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorResponse {
  message: string;
  stack?: string; // Only in development
}