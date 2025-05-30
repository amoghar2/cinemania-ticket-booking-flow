
import React from 'react';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, LogIn } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute = ({ children, fallback }: ProtectedRouteProps) => {
  const defaultFallback = (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="p-8">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in to access your bookings and continue with the booking process.
          </p>
          <Button className="w-full">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In to Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>{fallback || defaultFallback}</SignedOut>
    </>
  );
};

export default ProtectedRoute;
