import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const HAS_API = !!import.meta.env.VITE_API_BASE_URL;

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (HAS_API && !isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}